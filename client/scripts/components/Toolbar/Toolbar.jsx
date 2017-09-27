// @flow

///////////////////////////////////////////////////////////////////////////////
// @file         : Toolbar.jsx                                               //
// @summary      : Toolbar component                                         //
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

import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as Actions from '../../actions/ToolBar';
import type { ToolBar } from '../../types';
// Import images
import * as images from './images';
// Import styles
import Style from './Toolbar.css';

type Props = {
  toolbar: ToolBar,
  actions: any
};

type State = {
  ToolBar: ToolBar
};

function mapStateToProps (state: State) {
  return {
    toolbar: state.ToolBar.toJS()
  };
}

function mapDispatchToProps (dispatch: Dispatch) {
  return {
    actions: bindActionCreators(Actions, dispatch)
  };
}

const Toolbar = (props: Props) => {

  const { actions, toolbar } = props;
  const buttons = Object.keys(toolbar);

  function handleChange ({ target }: SyntheticInputEvent<HTMLInputElement>) : void {
    const { value } = target;
    const options = buttons.reduce((previous, option) => {
      return Object.assign({}, previous, {
        [option]: (option === value)
      });
    }, {});
    console.log('actions.set()', options);
    actions.set(options);
  }

  function makeButtons (button: string, index: number) : any {
    return (
      <li className={ Style.radioButton } key={ index } >
        <input
          type="radio"
          name="toolbar"
          id={ button }
          value={ button }
          checked={ props.toolbar[button] }
          onChange={ handleChange }
        />
        <label className={ Style.radioButton } htmlFor={ button } >
          <img src={ images[button] }></img>
        </label>
      </li>
    );
  }

  return ( <ul className={ Style.toolbar }>{ buttons.map(makeButtons) }</ul> );

};

Toolbar.propTypes = {
  toolbar: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar);
