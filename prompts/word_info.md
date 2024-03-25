For the following requested phrase/word give information in json data. (lemma other). Give pure JSON response.


e.g. response:

  {
    "slang": false,
    "lemma": "do",
    "definitions": [
        {
            text: "to accomplish something",
            examples: ["let's do this"]
        }
    ],
    "phrase": false,
    "part_of_speech": "verb",
    "inflections": [
      [
        {
            text: "do",
            pronounciation: "du",
        },
        {
            text: "did",
            pronounciation: "dɪd",
            "description": "paste tence for \"do\""
        },
        "does",
        "doing",
        "done"
      ],
    ],
   "synonyms": ["make"],
    "antonyms": ["undo"],
  },

e.g. response 2:
  {
    "lemma": "have",
    "slang": false,
    "definitions": [{text: "to be in process of doing something", examples: ["I am having a dinner"]}],
    "phrase": false,
    "part_of_speech": "verb",
    "inflections": [
      [
        {
            "text": "have",
            "pronounciation": "hæv",
            description: "...",
        },
        {
            "text": "had",
            "pronounciation": "hæd",
            description: "...",
        },
        {
            "text": "has",
            "pronounciation": "hæz",
            description: "...",
        },
        {
            "text": "having"
            "pronounciation": "hævɪŋ",
            description: "...",
        },
      ],
    ],
    "synonyms": [""],
    "antonyms": ["lack"]
  },
```
e.g. response 3 

{
    "slang": false,
    "definitions": [{text: "Used when you meet someone", examples: ["Nice to meet you."]}],
    "phrase": true,
    "part_of_speech": "verb",
    "inflections": [
	{
		"text": "nice to meet you",
		"slang": false,
        "pronounciation": "....",

	},
	{
		"text": "nice to meet ya",
		"slang": true,
        "pronounciation": "...."
	},
    ]
  }

Request: better
