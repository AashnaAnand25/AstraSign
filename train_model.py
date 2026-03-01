"""
train_model.py — Train a custom LSTM on pre-extracted MediaPipe keypoints.
Uses data augmentation (noise injection, time-shift) to boost accuracy.
"""
import os
import json
import numpy as np
import tensorflow as tf
from tensorflow import keras
from sklearn.model_selection import train_test_split

# ── Config ──────────────────────────────────────────────────────────
DATA_DIR       = "example_repo8/keys_dataset"
MODEL_OUT      = "asl_model.keras"
LABELS_OUT     = "asl_labels.json"
EPOCHS         = 200
BATCH_SIZE     = 32
MIN_SAMPLES    = 6   # Only include words with at least this many samples
SEQ_LEN_TARGET = 10
AUG_FACTOR     = 10  # Generate N augmented copies per original sample
# ────────────────────────────────────────────────────────────────────

# 1. Discover words with enough data
all_words = sorted([w for w in os.listdir(DATA_DIR) if not w.startswith('.')])
words = []
for w in all_words:
    wdir = os.path.join(DATA_DIR, w)
    n = len([f for f in os.listdir(wdir) if f.endswith('.npy')])
    if n >= MIN_SAMPLES:
        words.append(w)

print(f"Selected {len(words)} words (≥{MIN_SAMPLES} samples each):")
print(words)

# 2. Load and augment data
def pad_or_truncate(seq, target_len):
    if len(seq) < target_len:
        pad = np.zeros((target_len - len(seq), seq.shape[1]))
        return np.vstack([seq, pad])
    return seq[:target_len]

def augment(seq):
    """Apply random noise + optional time shift."""
    aug = seq.copy()
    # Gaussian noise
    aug += np.random.normal(0, 0.005, aug.shape)
    # Random time shift (roll along frame axis by 0-2 frames)
    shift = np.random.randint(-2, 3)
    aug = np.roll(aug, shift, axis=0)
    return aug

X, y = [], []
for idx, word in enumerate(words):
    word_dir = os.path.join(DATA_DIR, word)
    npy_files = sorted([f for f in os.listdir(word_dir) if f.endswith('.npy')])
    for nf in npy_files:
        seq = np.load(os.path.join(word_dir, nf))
        seq = pad_or_truncate(seq, SEQ_LEN_TARGET)
        # Original
        X.append(seq)
        y.append(idx)
        # Augmented copies
        for _ in range(AUG_FACTOR):
            X.append(augment(seq))
            y.append(idx)

X = np.array(X, dtype=np.float32)
y = np.array(y)
N_CLASSES = len(words)
print(f"Dataset: {X.shape[0]} samples, seq_len={SEQ_LEN_TARGET}, features={X.shape[2]}, classes={N_CLASSES}")

# 3. One-hot encode labels
y_cat = tf.keras.utils.to_categorical(y, N_CLASSES)

# 4. Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y_cat, test_size=0.15, random_state=42, stratify=y
)
print(f"Train: {len(X_train)}, Test: {len(X_test)}")

# 5. Build LSTM model
model = keras.Sequential([
    keras.layers.Input(shape=(SEQ_LEN_TARGET, X.shape[2])),
    keras.layers.LSTM(64, return_sequences=True),
    keras.layers.Dropout(0.2),
    keras.layers.LSTM(128, return_sequences=True),
    keras.layers.Dropout(0.2),
    keras.layers.LSTM(64),
    keras.layers.Dense(128, activation='relu'),
    keras.layers.Dropout(0.2),
    keras.layers.Dense(64, activation='relu'),
    keras.layers.Dense(N_CLASSES, activation='softmax')
])

model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)
model.summary()

# 6. Train
early_stop = keras.callbacks.EarlyStopping(
    monitor='val_accuracy', patience=30, restore_best_weights=True
)
reduce_lr = keras.callbacks.ReduceLROnPlateau(
    monitor='val_loss', factor=0.5, patience=10, min_lr=1e-6
)

model.fit(
    X_train, y_train,
    validation_data=(X_test, y_test),
    epochs=EPOCHS,
    batch_size=BATCH_SIZE,
    callbacks=[early_stop, reduce_lr],
    verbose=1
)

# 7. Evaluate
loss, acc = model.evaluate(X_test, y_test, verbose=0)
print(f"\nTest accuracy: {acc:.2%}")

# 8. Save
model.save(MODEL_OUT)
with open(LABELS_OUT, 'w') as f:
    json.dump(words, f)

print(f"\nModel saved to {MODEL_OUT}")
print(f"Labels saved to {LABELS_OUT}")
print(f"Vocabulary ({N_CLASSES} words): {words}")
