///////////////////////////////////////////////////////////////////////////////
// @file         : index.jsx                                                 //
// @summary      : Application entry point                                   //
// @version      : 0.0.1                                                     //
// @project      : tickelr                                                   //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 13 Feb 2017                                               //
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

import React, { Component } from 'react';
// import mimeTypes from 'mimer/lib/data/mime.types';
// import txt from './types.txt';
// import * as DataURI from 'datauri-build';
// const Datauri = require('datauri').promise;
import { WebView } from '../../components';
import './About.css';

// console.log('mimeTypes', mimeTypes);
// console.log('txt', txt);

// console.log(DataURI('/Users/bmaggi/tickler/hello.html'));

const elements = ['Hydrogen', 'Helium', 'Lithium', 'Beryllium', 'Boron', 'Carbon', 'Nitrogen', 'Oxygen', 'Fluorine', 'Neon', 'Sodium', 'Magnesium', 'Aluminium', 'Silicon', 'Phosphorus', 'Sulfur', 'Chlorine', 'Argon', 'Potassium', 'Calcium', 'Scandium', 'Titanium', 'Vanadium', 'Chromium', 'Manganese', 'Iron', 'Cobalt', 'Nickel', 'Copper', 'Zinc', 'Gallium', 'Germanium', 'Arsenic', 'Selenium', 'Bromine', 'Krypton', 'Rubidium', 'Strontium', 'Yttrium', 'Zirconium', 'Niobium', 'Molybdenum', 'Technetium', 'Ruthenium', 'Rhodium', 'Palladium', 'Silver', 'Cadmium', 'Indium', 'Tin', 'Antimony', 'Tellurium', 'Iodine', 'Xenon', 'Caesium', 'Barium', 'Lanthanum', 'Cerium', 'Praseodymium', 'Neodymium', 'Promethium', 'Samarium', 'Europium', 'Gadolinium', 'Terbium', 'Dysprosium', 'Holmium', 'Erbium', 'Thulium', 'Ytterbium', 'Lutetium', 'Hafnium', 'Tantalum', 'Tungsten', 'Rhenium', 'Osmium', 'Iridium', 'Platinum', 'Gold', 'Mercury', 'Thallium', 'Lead', 'Bismuth', 'Polonium', 'Astatine', 'Radon', 'Francium', 'Radium', 'Actinium', 'Thorium', 'Protactinium', 'Uranium', 'Neptunium', 'Plutonium', 'Americium', 'Curium', 'Berkelium', 'Californium', 'Einsteinium', 'Fermium', 'Mendelevium', 'Nobelium', 'Lawrencium', 'Rutherfordium', 'Dubnium', 'Seaborgium', 'Bohrium', 'Hassium', 'Meitnerium', 'Darmstadtium', 'Roentgenium', 'Copernicium', 'Nihonium', 'Flerovium', 'Moscovium', 'Livermorium', 'Tennessine', 'Oganesson'];
const data = 'data:text/html;base64,PCFET0NUWVBFIGh0bWw+CjxodG1sIGxhbmc9ImVuIj4KCjxoZWFkPgogIDxtZXRhIGNoYXJzZXQ9InV0Zi04Ij4KICA8dGl0bGU+SGVsbG8gV29ybGQ8L3RpdGxlPgogIDxzdHlsZSB0eXBlPSd0ZXh0L2Nzcyc+CiAgICBodG1sLCAuYm9keSB7CiAgICAgIGJhY2tncm91bmQtY29sb3I6IHJlZAogICAgfQogIDwvc3R5bGU+CjwvaGVhZD4KCjxib2R5PgogIDxoMT5IZWxsbyBXb3JsZDwvaDE+CiAgPHA+IEphbWllIHdhcyBoZXJlLiA8L3A+CjwvYm9keT4KCjwvaHRtbD4K';

const Item = ({title}) => {
  return (
    <span>{ title }</span>
  );
};

class List extends Component {

  static defaultProps = {
    items: ['Red','Green','Blue','Yellow','Black','White','Orange']
  };

  constructor(props) {
    super(props);
    this.state = {
      items: props.items
    };
    this.placeholder = document.createElement('li');
    this.placeholder.className = 'placeholder';
    this.placeholder.style.backgroundColor = '#00f';
    this.placeholder.style.minHeight = '12px';
  }

  dragStart = event => {
    this.dragged = event.currentTarget;
    event.dataTransfer.effectAllowed = 'move';
    // Firefox requires dataTransfer data to be set
    event.dataTransfer.setData('text/html', event.currentTarget);
  }

  dragEnd = event => {
    const { placeholder } = this;
    this.dragged.style.display = 'block';
    this.dragged.parentNode.removeChild(placeholder);
    // Update data
    var items = this.state.items;
    var from = Number(this.dragged.dataset.id);
    var to = Number(this.over.dataset.id);
    if(from < to) to--;
    if(this.nodePlacement == 'after') to++;
    items.splice(to, 0, items.splice(from, 1)[0]);
    this.setState({ items });
  }

  dragOver = event => {
    event.preventDefault();
    const { placeholder } = this;
    this.dragged.style.display = 'none';
    if(event.target.className == 'placeholder') return;
    this.over = event.target;
    // Inside the dragOver method
    var relY = event.clientY - this.over.offsetTop;
    var height = this.over.offsetHeight / 2;
    var parent = event.target.parentNode;

    if(relY > height) {
      this.nodePlacement = 'after';
      parent.insertBefore(placeholder, event.target.nextElementSibling);
    }
    else if(relY < height) {
      this.nodePlacement = 'before';
      parent.insertBefore(placeholder, event.target);
    }
  }

  render () {
    return (
      <ul onDragOver={this.dragOver}>
      { this.state.items.map((item, i) => (<li item-id={i} key={i} draggable="true" onDragEnd={this.dragEnd} onDragStart={this.dragStart} ><Item { ...{ title: item } } /></li>))}
      </ul>
    );
  }
}

export default class About extends Component {
  render () {
    const src = "about:blank";
    const style = "page";
    return (
      <div className="about">
        <h1>About</h1>
        <WebView src={ data } className={ style } />
        { /* <List { ...{ items: elements }} /> */ }
      </div>
    );
  }
}
