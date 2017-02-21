import React from 'react';
import classNames from 'classnames';

const Cover = (props) =>
  <ul className="covers">{props.list.map((cover, index) => {
      let style = classNames('cover', {
        active: cover.get('isPlaying')
      });
      let url = cover.getIn(['thumbnails', 'default', 'url']);
      return (
        <li className={style} key={index} onMouseOver={() => props.setTitle(cover)}>
          <img src={url} />
        </li>
      );
    })
  }</ul>

export default Cover;
