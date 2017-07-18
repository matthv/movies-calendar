import React, { Component } from 'react';
import Lightbox from 'react-image-lightbox';

class LightboxImages extends Component {
  constructor(props) {
    super(props);

    this.state = {
      photoIndex: 0,
      isOpen: false
    };
  }

  handleShow(n){
    this.setState({ isOpen: true, photoIndex: n });
  }

  renderImages() {
    return this.props.images.map((image, index) => {
      return (
        <img
          key={index}
          src={image.thumb}
          width="100"
          alt={index+1}
          onClick={() => this.handleShow(index)} />
      )
    });
  }

  render() {
    const { photoIndex, isOpen } = this.state;
    const images = [];
    this.props.images.map((image) => { return images.push(image.img) });

    return (
      <div>
        {this.renderImages()}
        {isOpen &&
        <Lightbox
          mainSrc={images[photoIndex]}
          nextSrc={images[(photoIndex + 1) % images.length]}
          prevSrc={images[(photoIndex + images.length - 1) % images.length]}
          onCloseRequest={() => this.setState({ isOpen: false })}
          onMovePrevRequest={() => this.setState({
            photoIndex: (photoIndex + images.length - 1) % images.length,
          })}
          onMoveNextRequest={() => this.setState({
            photoIndex: (photoIndex + 1) % images.length,
          })}
          enableZoom={false}
        />
        }
      </div>
    );
  }
}

export default LightboxImages;