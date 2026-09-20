import os
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Flatten, Dense, Dropout
import numpy as np
from PIL import Image

def main():
    print("Loading CIFAR-10 dataset...")
    (X_train, y_train), (X_test, y_test) = tf.keras.datasets.cifar10.load_data()

    print("Preprocessing data (float32 / 255.0)...")
    X_train = X_train.astype("float32") / 255.0
    X_test = X_test.astype("float32") / 255.0

    y_train = y_train.reshape(-1)
    y_test = y_test.reshape(-1)

    print("Defining exact ANN architecture from notebook...")
    model = Sequential([
        Flatten(input_shape=(32, 32, 3)),
        Dense(512, activation="relu"),
        Dropout(0.3),
        Dense(256, activation="relu"),
        Dropout(0.3),
        Dense(128, activation="relu"),
        Dense(10, activation="softmax")
    ])

    model.compile(
        optimizer="adam",
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )

    print("Training model (20 epochs, batch size 128, validation split 0.2)...")
    model.fit(
        X_train,
        y_train,
        epochs=20,
        batch_size=128,
        validation_split=0.2,
        verbose=1
    )

    loss, acc = model.evaluate(X_test, y_test, verbose=0)
    print(f"Test Accuracy: {acc * 100:.2f}%, Test Loss: {loss:.4f}")

    os.makedirs("models", exist_ok=True)
    model_path = os.path.join("models", "cifar10_model.keras")
    model.save(model_path)
    print(f"Model successfully saved to {model_path}")

    # Save a few sample test images for manual testing and demo purposes
    samples_dir = os.path.join("app", "static", "images", "samples")
    os.makedirs(samples_dir, exist_ok=True)
    
    class_names = [
        "airplane", "automobile", "bird", "cat", "deer",
        "dog", "frog", "horse", "ship", "truck"
    ]

    # Save 1 sample image for each class from X_test (original uint8 values before normalization)
    (X_train_raw, _), (X_test_raw, y_test_raw) = tf.keras.datasets.cifar10.load_data()
    y_test_raw = y_test_raw.reshape(-1)
    
    saved_classes = set()
    for i in range(len(y_test_raw)):
        cls_idx = y_test_raw[i]
        if cls_idx not in saved_classes:
            cls_name = class_names[cls_idx]
            img = Image.fromarray(X_test_raw[i])
            # Save enlarged slightly for sample gallery preview (e.g. 128x128 with nearest neighbor to preserve pixel art or bicubic)
            sample_file = os.path.join(samples_dir, f"sample_{cls_name}.png")
            img.save(sample_file)
            saved_classes.add(cls_idx)
        if len(saved_classes) == 10:
            break
            
    print(f"Saved {len(saved_classes)} sample test images into {samples_dir}")

if __name__ == "__main__":
    main()
