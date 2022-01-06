from keras.datasets import mnist
from keras.models import Sequential
from keras.layers import Dense, Flatten, Dropout, Conv2D, MaxPooling2D
from matplotlib import plt

from keras.utils import np_utils

def input_data():
    """
    Достает и подготавливает входные данные 
    """
    (X_train, y_train), (X_test, y_test) = mnist.load_data()

    # приводим к размерности (количество образцов, ширина, высота, количество каналов)
    X_train = X_train.reshape(X_train.shape[0], 28, 28, 1).astype('float32')
    X_test = X_test.reshape(X_test.shape[0], 28, 28, 1).astype('float32')

    # разбиваем на категории
    y_train = np_utils.to_categorical(y_train)
    y_test = np_utils.to_categorical(y_test)

    # Переводим int в float для дальнейшей нормализации 
    X_train = X_train.astype('float32')
    X_test = X_test.astype('float32')

    # Нормализуем изображения и меняем местами цвет числа и фона
    # Это необходимо из-за того, что в mnist белые числа на черном фоне, а анализировать мы хотим в инвертированном формате
    X_train = 1 - (X_train / 255.0)
    X_test = 1 - (X_test / 255.0)

    return X_test, y_test, X_train, y_train

def create_model():
    """
    Компилируем подготовленную модель
    """
    # построение сверточной нейронной сети
    model = Sequential()

    # первая свертка
    model.add(Conv2D(64, (3, 3), activation='relu', kernel_initializer='he_uniform', input_shape=(28, 28, 1)))
    model.add(MaxPooling2D((2, 2)))

    # вторая свертка
    model.add(Conv2D(128, (3, 3), activation='relu', kernel_initializer='he_uniform'))
    model.add(MaxPooling2D((2, 2)))

    # Переводим каждую 28x28 картинку в 784 мерный вектор
    model.add(Flatten())

    # дополннительный полносвязный слой
    model.add(Dense(128, activation='relu', kernel_initializer='he_uniform'))

    # Избегаем лишних прогонов
    model.add(Dropout(0.5))
    model.add(Dense(10, activation='softmax'))

    # Компилируем подготовленную модель
    model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])

    return model

def test(X_train, model):
    """
    Визуально тестирует подготовленную модель
    """

    # выделяем тестовый набор
    test_images = X_train[1:5]
    test_images = test_images.reshape(test_images.shape[0], 28, 28)

    # прогоняемся по изображениям из тестового набора и отображаем предсказания для них
    for i, test_image in enumerate(test_images, start=1):
        # подготовка изображения
        org_image = test_image
        test_image = test_image.reshape(1, 28, 28, 1)

        # вычисление результата для изображения
        prediction = model.predict_classes(test_image, verbose=0)

        # отрисовка результатов
        print("Predicted digit: {}".format(prediction[0]))
        plt.subplot(220 + i)
        plt.axis('off')
        plt.title("Predicted digit: {}".format(prediction[0]))
        plt.imshow(org_image, cmap=plt.get_cmap('gray'))

    plt.show()


def run():
    X_test, y_test, X_train, y_train = input_data()

    # создаем модель
    model = create_model()
    print("Model created")

    # тренируем модель
    model.fit(X_train, y_train, validation_data=(X_test, y_test), epochs=10, batch_size=64)

    # сохраняем модель в формате HDF5
    model.save("model.h5")
    print("Saved model to disk")

run()