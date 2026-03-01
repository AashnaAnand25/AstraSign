"""
train_classifier.py — Train a Random Forest on collected hand landmark data.

Reads normalized hand landmark .npy files from training_data/,
trains a Random Forest classifier, and saves the model + labels.
"""
import os
import json
import numpy as np
import pickle
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score

DATA_DIR    = "training_data"
MODEL_OUT   = "asl_classifier.pkl"
LABELS_OUT  = "asl_labels.json"

def main():
    # Discover signs
    signs = sorted([d for d in os.listdir(DATA_DIR) 
                    if os.path.isdir(os.path.join(DATA_DIR, d)) and not d.startswith('.')])
    
    if not signs:
        print("No training data found! Run collect_data.py first.")
        return
    
    print(f"Found {len(signs)} signs: {signs}")
    
    X, y = [], []
    for idx, sign in enumerate(signs):
        sign_dir = os.path.join(DATA_DIR, sign)
        files = sorted([f for f in os.listdir(sign_dir) if f.endswith('.npy')])
        print(f"  {sign}: {len(files)} samples")
        for f in files:
            data = np.load(os.path.join(sign_dir, f))
            X.append(data)
            y.append(idx)
    
    X = np.array(X)
    y = np.array(y)
    print(f"\nTotal: {len(X)} samples, {X.shape[1]} features")
    
    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Train Random Forest
    clf = RandomForestClassifier(
        n_estimators=200,
        max_depth=20,
        min_samples_split=3,
        random_state=42,
        n_jobs=-1
    )
    
    # Cross-validation
    scores = cross_val_score(clf, X, y, cv=min(5, min(np.bincount(y))), scoring='accuracy')
    print(f"\nCross-validation accuracy: {scores.mean():.2%} (+/- {scores.std():.2%})")
    
    # Final training on all data for deployment
    clf.fit(X, y)
    
    # Test accuracy
    test_acc = clf.score(X_test, y_test)
    print(f"Holdout test accuracy: {test_acc:.2%}")
    
    # Save model and labels
    with open(MODEL_OUT, 'wb') as f:
        pickle.dump(clf, f)
    
    with open(LABELS_OUT, 'w') as f:
        json.dump(signs, f)
    
    print(f"\n✅ Model saved to {MODEL_OUT}")
    print(f"✅ Labels saved to {LABELS_OUT}")
    print(f"   Vocabulary ({len(signs)} signs): {signs}")
    print(f"\nRun 'python main.py' to test in real-time!")


if __name__ == '__main__':
    main()
