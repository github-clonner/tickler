const { isEmpty } = require('lib/utils');
const ModalStyles = require('./ModalStyles.json');
const ModalTypes = require('./ModalTypes.json');

const getStyleTypeProps = (type, style) => {
  const { DEFAULT, [type]: props = { ...DEFAULT, ...type }} = ModalStyles[style];
  return { ...props };
};
const getStyle = (type) => getStyleTypeProps(type, 'styles');

ModalStyles.styles = Object.entries(ModalStyles.styles).reduce((styles, [ style, props ]) => {
  const { buttons } = ModalStyles;
  return {
    ...styles,
    [style]: {
      ...props,
      ...!isEmpty(props.buttons) ? { buttons: props.buttons.map((name) => buttons[name] || buttons[DEFAULT]) } : undefined
    }
  };
}, {});

module.exports = {
  ModalTypes,
  ModalStyles,
  getStyle,
  getStyleTypeProps
};
