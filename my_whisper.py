import whisper

# model = whisper.load_model("base")

# # load audio and pad/trim it to fit 30 seconds
# audio = whisper.load_audio("public/pizza.mp3")
# audio = whisper.pad_or_trim(audio)

# # make log-Mel spectrogram and move to the same device as the model
# mel = whisper.log_mel_spectrogram(audio).to(model.device)

# # detect the spoken language
# _, probs = model.detect_language(mel)
# print(f"Detected language: {max(probs, key=probs.get)}")

# # decode the audio
# options = whisper.DecodingOptions()
# result = whisper.decode(model, mel, options)

# # print the recognized text
# print(result.text)

import numpy as np

print("Script started")

print("Loading model...")
model = whisper.load_model("base")

print("Loading audio...")
audio = whisper.load_audio("public/pizza.mp3")

# Function to process 30-second segments
def process_segment(segment, segment_number):
    print(f"\nProcessing segment {segment_number}...")
    
    # Pad or trim the segment to 30 seconds
    segment = whisper.pad_or_trim(segment)
    
    # Create log-Mel spectrogram
    mel = whisper.log_mel_spectrogram(segment).to(model.device)
    
    # Detect language (only for the first segment)
    if segment_number == 1:
        _, probs = model.detect_language(mel)
        print(f"Detected language: {max(probs, key=probs.get)}")
    
    # Decode the audio
    options = whisper.DecodingOptions()
    result = whisper.decode(model, mel, options)
    
    print(f"Segment {segment_number} transcription:")
    print(result.text, result.segments)

# Process audio in 30-second segments
segment_length = 30 * 16000  # 30 seconds * 16000 (sample rate)
for i, start in enumerate(range(0, len(audio), segment_length), 1):
    end = start + segment_length
    segment = audio[start:end]
    process_segment(segment, i)

print("\nScript completed")