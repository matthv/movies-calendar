import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import YouTube from 'react-youtube';

class Trailer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false
    };

    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState({
      modal: !this.state.modal
    });
  }

  renderVideo(){
    let opts = {
      width: '100%',
      playerVars: {
        autoplay: 1,
        fs: 1
      }
    };

    return (
      <YouTube
        id="trailer-video"
        videoId={this.props.video_id}
        opts={opts}
      />
    );
  }

  render() {
    return (
      <div>
        <div className="btn btn-pink mt-4" onClick={this.toggle}>
          <i className="fa fa-play-circle" aria-hidden="true"></i> {this.props.name}
        </div>
        <Modal isOpen={this.state.modal} toggle={this.toggle} className="modal-lg">
          <ModalHeader toggle={this.toggle}>{this.props.name}</ModalHeader>
          <ModalBody>
            {this.renderVideo()}
          </ModalBody>
        </Modal>
      </div>
    );
  }
};

export default Trailer;