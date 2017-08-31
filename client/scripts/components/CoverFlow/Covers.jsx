import React from 'react';
import classNames from 'classnames';
import { noalbum } from '../../../../assets/images';

const getDefaultCoverImage = function (thumbnails) {
  try {
    return thumbnails.default.url;
  } catch (error) {
    return noalbum; 
  }
};

const Cover = (props) => {
  const { list, setTitle } = props;
  return (<ul className="covers">{
    list.map((cover, index) => {
      const style = classNames('cover', {
        active: cover.get('isPlaying')
      });
      const thumbnails = cover.get('thumbnails');
      return (
        <li className={style} key={index} onMouseOver={() => setTitle(cover)}>
          <img src={getDefaultCoverImage(thumbnails)} />
        </li>
      );
    })
  }</ul>);
};

export default Cover;
