import './App.css';
import React from 'react';

const Ascii = ({ src }: { src: string }) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const image = new Image();
    image.src = src;

    if (!context) {
        return <>"okayyyyy</>;
    }
    canvas.width = image.width;
    canvas.height = image.height;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0);

    return <>"okay here"</>;
};

function App() {
    const [selectedImage, setSelectedImage] = React.useState('./vibes.jpg');

    const onChange = (newImage: string) => {
        setSelectedImage(newImage);
    };

    return (
        <>
            <div>
                <input
                    type="file"
                    name="myImage"
                    onChange={(event) => {
                        if (event.target.files && event.target.files[0]) {
                            console.log('CHANINGGG');
                            onChange(URL.createObjectURL(event.target.files[0]));
                        }
                    }}
                />
            </div>
            <div>
                {selectedImage !== '' && (
                    <div>
                        <h3>{`current image src: ${selectedImage}`}</h3>

                        <img alt="not fount" width={'250px'} src={selectedImage} />
                        <br />
                        <h3>{'canvas'}</h3>

                        <Ascii src={selectedImage} />
                    </div>
                )}
                <br />
            </div>
        </>
    );
}

export default App;
