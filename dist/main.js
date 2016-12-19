const findDOMNode = ReactDOM.findDOMNode;
const gui = require('nw.gui');
const os = require('os');
const EventEmitter = require('events');
const appEmitter = new EventEmitter();
const fs = require('fs');

alert('xx1x')

const path = './';
fs.watch(path, { recursive: true }, function() {
  if (location)
    location.reload();
});

class Categories extends React.Component {

  state = {
    categories: ["name", "age", "gender"]
  }

  componentDidMount () {
    appEmitter.on('event', this.addCategory.bind(this));
  }

  addCategory (category) {
    this.setState({
      categories: this.state.categories.concat([category])
    })
  }

  renderCategories(categories) {
    return categories.map((category, idx) => {
      return (
        <li className="list-group-item" key={idx}>{category}</li>
      );
    });
  }

  render() {
    let {categories} = this.state;

    return (
      <ul className="list-group">
        {this.renderCategories(categories)}
      </ul>
    );
  }
}

class Toolbar extends React.Component {
  static propTypes = {
    toolbar: React.PropTypes.object
  };

  static defaultProps = {
    toolbar: {
      play: [{
        label: 'play',
        icon: 'fa fa-fw fa-cogs',
        action: event => {
          appEmitter.emit('getCodeMirror', function(codeMirror) {
            let code = codeMirror.getValue();
            console.log(code);
            eval(code)
          })
        }
      },{
        label: 'stop',
        icon: 'fa fa-fw fa-stop',
        action: event => {console.log(event)}
      },{
        label: 'pause',
        icon: 'fa fa-fw fa-pause',
        action: event => {appEmitter.emit('event', chance.word())}
      }],
      debug: [{
        label: 'random',
        icon: 'fa fa-fw fa-random',
        action: event => {gui.Window.open('https://github.com')}
      }]
    }
  };

  makeButtons(buttons) {
    return buttons.map(button => {
      return (
        <button type="button" className="btn btn-default" key={button.label} onClick={(event) => button.action(event)}><i className={button.icon}></i></button>
      );
    });
  }

  makeToolbar(toolbarGroup) {
    return toolbarGroup.map(group => {
      let {toolbar} = this.props;
      let buttons = toolbar[group];
      return (
        <div className="btn-group" role="group" key={group}>
          {this.makeButtons(buttons)}
        </div>
      );
    })
  }

  render () {
    let {toolbar} = this.props;
    return (
      <div className="btn-toolbar" role="toolbar">
        {this.makeToolbar(Object.keys(toolbar))}
      </div>
    );
  }


}

class Editor extends React.Component {

  static propTypes = {
    className: React.PropTypes.any,
    codeMirrorInstance: React.PropTypes.func,
    defaultValue: React.PropTypes.string,
    onChange: React.PropTypes.func,
    onFocusChange: React.PropTypes.func,
    onScroll: React.PropTypes.func,
    options: React.PropTypes.object,
    path: React.PropTypes.string,
    value: React.PropTypes.string,
    preserveScrollPosition: React.PropTypes.bool,
  }

  componentDidMount () {
    const textareaNode = findDOMNode(this.refs.textarea);
    const codeMirrorInstance = this.getCodeMirrorInstance();
    this.codeMirror = codeMirrorInstance.fromTextArea(textareaNode, this.props.options);
    appEmitter.on('getCodeMirror', this.getCodeMirror.bind(this));
  }

  getCodeMirror (callback) {
    return callback(this.codeMirror);
  }

  getCodeMirrorInstance () {
    return this.props.codeMirrorInstance || CodeMirror;
  }

  render () {
    return (
      <div>
        <textarea ref="textarea" name={this.props.path} defaultValue={this.props.value} autoComplete="off" />
      </div>
    );
  }
}

ReactDOM.render(
  <Categories />,
  document.getElementById('categories')
);

ReactDOM.render(
  <Toolbar />,
  document.querySelector('toolbar')
);


ReactDOM.render(
  <Editor options={{
    mode: 'javascript',
    lineNumbers: true,
    styleActiveLine: true,
    theme: 'material'
  }}/>,
  document.querySelector('codemirror')
);
