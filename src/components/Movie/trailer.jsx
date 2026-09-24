import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import YouTube from 'react-youtube';

const OPTS = {
  width: '100%',
  playerVars: { autoplay: 1, fs: 1 },
};

export default function Trailer({ videoId, name }) {
  const [open, setOpen] = useState(false);

  if (!videoId) return null;

  return (
    <div>
      <button type="button" className="btn btn-pink mt-4" onClick={() => setOpen(true)}>
        <i className="fa-solid fa-circle-play" aria-hidden="true"></i> {name}
      </button>
      <Modal show={open} onHide={() => setOpen(false)} size="lg">
        <Modal.Header closeButton closeVariant="white">
          <Modal.Title>{name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <YouTube id="trailer-video" videoId={videoId} opts={OPTS} />
        </Modal.Body>
      </Modal>
    </div>
  );
}
