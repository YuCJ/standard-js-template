# AI Anki

## Words -> Anki

1. generate_anki_cards
2. add_word_voices_to_cards
3. add_google_voices_to_cards

```sh
INPUT_FILE=unfamiliar_words.txt node lib/generate_anki_cards.js
INPUT_FILE=unfamiliar_words.cards.txt node lib/add_word_voices_to_cards.js
INPUT_FILE=unfamiliar_words.cards.word-voice-cards.txt VOICE_SOURCE_INDEX=2 node lib/add_google_voices_to_cards.js
```

## Article -> Anki

1. article_to_anki_cards
2. add_google_voices_to_cards

```sh
INPUT_FILE=negative-feedback.txt node lib/article_to_anki_cards.js
INPUT_FILE=negative-feedback.cards.txt VOICE_SOURCE_INDEX=2 VOICE_NAME=en-US-Wavenet-J SPEAKING_RATE=0.91 node lib/add_google_voices_to_cards.js
```

## Article -> Playlist

1. article_to_audio_and_playlist

```sh
INPUT_FILE=different-work-style.txt VOICE_NAME=en-US-Wavenet-J SPEAKING_RATE=0.91 node lib/article_to_audio_and_playlist.js
```
