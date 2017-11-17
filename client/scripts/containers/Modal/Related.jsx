///////////////////////////////////////////////////////////////////////////////
// @file         : Related.jsx                                               //
// @summary      : Related media list                                        //
// @version      : 1.0.0                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 17 Nov 2017                                               //
// @license:     : MIT                                                       //
// ------------------------------------------------------------------------- //
//                                                                           //
// Copyright 2017 Benjamin Maggi <benjaminmaggi@gmail.com>                   //
//                                                                           //
//                                                                           //
// License:                                                                  //
// Permission is hereby granted, free of charge, to any person obtaining a   //
// copy of this software and associated documentation files                  //
// (the "Software"), to deal in the Software without restriction, including  //
// without limitation the rights to use, copy, modify, merge, publish,       //
// distribute, sublicense, and/or sell copies of the Software, and to permit //
// persons to whom the Software is furnished to do so, subject to the        //
// following conditions:                                                     //
//                                                                           //
// The above copyright notice and this permission notice shall be included   //
// in all copies or substantial portions of the Software.                    //
//                                                                           //
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS   //
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF                //
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.    //
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY      //
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,      //
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE         //
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.                    //
//                                                                           //
///////////////////////////////////////////////////////////////////////////////

import Style from './Related.css';
// import 'react-virtualized/styles.css';
// import '!style-loader!css-loader!react-virtualized/styles.css';
import PropTypes from 'prop-types';
import { List, AutoSizer } from 'react-virtualized';
import React, { Component } from 'react';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import { Thumbnail, Caption } from '../../components';
import { random, shuffle } from '../../lib/utils';

const SortableItem = SortableElement(({ value }) => {
  const media = function ({ id, title, artist, description, image, duration, stats }) {
    return (
      <div className={ Style.media }>
        <Thumbnail image={ image } duration={ duration } stats={ stats } />
        <Caption title={ title } artist={ artist } description={ description } />
        <span className={ Style.fixmeText } >FIXME</span>
      </div>
    );
  };
  return (
    <div className={ Style.item }>
      {
        media({
          id: 'ABAXXX',
          title: value,
          artist: 'Van Helen',
          description: 'bla bla bla',
          image: `https://placeimg.com/320/180/${shuffle(['categoriesanimals', 'architecture', 'nature', 'people', 'tech'])}`,
          duration: `01:${random(10, 50)}`,
          stats: '1M views'
        })
      }
    </div>
  );
});

/*
class VirtualList extends Component {
  render() {
    const { items } = this.props;
    return (
      <AutoSizer>
      {({ height, width }) => (
        <List
          ref={(instance) => {
            this.List = instance;
          }}
          rowHeight={({ index }) => items[index].height}
          rowRenderer={({ index }) => {
            const { value } = items[index];
            return <SortableItem index={ index } value={ value } key={ index } />;
          }}
          rowCount={ items.length }
          width={ width }
          height={ height }
        />
      )}
      </AutoSizer>
    );
  }
}
*/

class VirtualList extends Component {
  render() {
    const { items } = this.props;
    return (
      <List
        ref={(instance) => {
          this.List = instance;
        }}
        rowHeight={({ index }) => items[index].height}
        rowRenderer={({ index }) => {
          const { value } = items[index];
          return <SortableItem index={ index } value={ value } key={ index } />;
        }}
        rowCount={ items.length }
        width={ 400 }
        height={ 600 }
      />
    );
  }
}

/*
 * Important note:
 * To access the ref of a component that has been wrapped with the SortableContainer HOC,
 * you *must* pass in { withRef: true } as the second param. Refs are opt-in.
 */

/*
const SortableList = SortableContainer(VirtualList, { withRef: true });
export class SortableComponent extends Component {
  state = {
    items: Array.from({ length: 50 }, (v, i) => ({ value: `Item ${i}`, height: 50 }))
  };

  onSortEnd = ({oldIndex, newIndex}) => {
    if (oldIndex !== newIndex) {
      const {items} = this.state;

      this.setState({
        items: arrayMove(items, oldIndex, newIndex),
      });

      // We need to inform React Virtualized that the items have changed heights
      const instance = this.SortableList.getWrappedInstance();

      instance.List.recomputeRowHeights();
      instance.forceUpdate();
    }
  };

  componentDidMount() {
    this.setState({
      items: Array.from({ length: 50 }, (v, i) => ({ value: `Track ${i}`, height: 50 }))
    });
  }

  render() {
    const { items } = this.state;
    return (
      <SortableList
        ref={(instance) => {
          this.SortableList = instance;
        }}
        items={ items }
        onSortEnd={ this.onSortEnd }
      />
    );
  }
}
*/

const SortableList = SortableContainer(({items}) => {
  return (
    <div className={ Style.list }>
      {items.map((value, index) => (
        <SortableItem key={`item-${index}`} index={index} value={value} />
      ))}
    </div>
  );
});

export class SortableComponent extends Component {
  state = {
    items: Array.from({ length: 150 }, (v, i) => `Item ${i}`),
  };
  onSortEnd = ({oldIndex, newIndex}) => {
    this.setState({
      items: arrayMove(this.state.items, oldIndex, newIndex),
    });
  };
  render() {
    return (
      <div className={ Style.related }>
        <SortableList items={ this.state.items } onSortEnd={ this.onSortEnd } />
      </div>
    );
  }
}


