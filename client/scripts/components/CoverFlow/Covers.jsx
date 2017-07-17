import React from 'react';
import classNames from 'classnames';

const Cover = (props) => {
  const { list, setTitle } = props;
  return (<ul className="covers">{
    list.map((cover, index) => {
      const style = classNames('cover', {
        active: cover.get('isPlaying')
      });
      const url = cover.getIn(['thumbnails', 'default', 'url']);
      return (
        <li className={style} key={index} onMouseOver={() => setTitle(cover)}>
          <img src={url} />
        </li>
      );
    })
  }</ul>);
}

export default Cover;
