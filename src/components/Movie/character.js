import React, { Component } from 'react';
import { Card, CardImg, CardText } from 'reactstrap';

class Character extends Component {

  render() {
    if(!this.props.character) {
      return (<div>Loading...</div>);
    }
    let character = this.props.character;
    let image_url = character.profile_path ?
      `https://image.tmdb.org/t/p/w300/${character.profile_path}`
      : `${process.env.PUBLIC_URL}/character-default.jpg`;

    return (
      <div className="col-sm-12 col-md-6">
        <Card block className="character">
          <CardImg top src={image_url} alt={character.name} />
          <CardText className="mt-4">
            <strong>{character.name}</strong>
          </CardText>
          <CardText>{character.character}</CardText>
        </Card>
      </div>
    );
  }
}

export default Character;