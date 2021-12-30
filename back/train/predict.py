import cv2
from tensorflow.keras.models import load_model
from os.path import abspath
from pathlib import Path

def predict(img):
    """
    Запускает модель на одном изображении
    """
    # подготавливаем картинку к анализу
    image = img.copy() 
    image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    image = cv2.resize(image, (28, 28))

    # сохраняем картинку для дебага
    cv2.imwrite("last.png", image)

    # завершаем приготовления картинки
    image = image.astype('float32')
    image = image.reshape(1, 28, 28, 1)
    image = image / 255

    # вычисляем директорию и находим текущую модель
    dir = Path(__file__).parent
    model = load_model(str(dir) + '/model.h5')

    # запускам модель на подготовленном изображении
    pred = model.predict(image, batch_size=1)
    print("Predicted Number: ", pred.argmax())

    # возвращаем результирующие веса в виде списка
    return pred[0].tolist()
