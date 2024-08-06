import whisper
from datasets import load_dataset
from transformers import WhisperFeatureExtractor, WhisperTokenizer, WhisperProcessor, WhisperForConditionalGeneration, Seq2SeqTrainingArguments, Seq2SeqTrainer

# Load your dataset
dataset = load_dataset("csv", data_files="your_uzbek_dataset.csv")

# Load pre-trained model and processor
model = WhisperForConditionalGeneration.from_pretrained("openai/whisper-base")
processor = WhisperProcessor.from_pretrained("openai/whisper-base")

# Prepare the dataset
def prepare_dataset(batch):
    audio = batch["audio"]
    batch["input_features"] = processor(audio["array"], sampling_rate=audio["sampling_rate"]).input_features[0]
    batch["labels"] = processor(text=batch["transcription"]).input_ids
    return batch

dataset = dataset.map(prepare_dataset, remove_columns=dataset.column_names)

# Set up training arguments
training_args = Seq2SeqTrainingArguments(
    output_dir="./whisper-uzbek",
    per_device_train_batch_size=8,
    gradient_accumulation_steps=2,
    learning_rate=1e-5,
    warmup_steps=500,
    max_steps=4000,
    gradient_checkpointing=True,
    fp16=True,
    evaluation_strategy="steps",
    predict_with_generate=True,
    generation_max_length=225,
    save_steps=1000,
    eval_steps=1000,
    logging_steps=25,
    report_to=["tensorboard"],
    load_best_model_at_end=True,
    metric_for_best_model="wer",
    greater_is_better=False,
    push_to_hub=False,
)

# Create Trainer
trainer = Seq2SeqTrainer(
    args=training_args,
    model=model,
    train_dataset=dataset["train"],
    eval_dataset=dataset["test"],
    data_collator=processor.feature_extractor,
    compute_metrics=compute_metrics,
    tokenizer=processor.feature_extractor,
)

# Start training
trainer.train()

