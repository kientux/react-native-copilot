// @flow
import React, { Component } from 'react';
import { View, Animated, Easing, Dimensions, TouchableWithoutFeedback } from 'react-native';
// import { Svg } from 'expo';
import Svg from 'react-native-svg';
import AnimatedSvgPath from './AnimatedPath';
import { CIRCLE_EXTRA_RADIUS } from './style';

import type { valueXY } from '../types';

const circlePadding = CIRCLE_EXTRA_RADIUS;
const windowDimensions = Dimensions.get('window');
const path = (size, position, canvasSize): string =>
  `M0,0H${canvasSize.x}V${canvasSize.y}H0V0ZM${position.x._value},${position.y._value}H${position.x
    ._value + size.x._value}V${position.y._value + size.y._value}H${position.x._value}V${
    position.y._value
  }Z`;
const circlePath = (size, position, canvasSize): string =>
  `M0,0H${canvasSize.x}V${canvasSize.y}H0V0ZM${position.x._value - circlePadding - 2},${position.y
    ._value +
    size.y._value / 2}a${size.x._value / 2 + circlePadding},${size.x._value / 2 +
    circlePadding} 0 1,0 ${size.x._value + circlePadding * 2},0a${size.x._value / 2 +
    circlePadding},${size.x._value / 2 + circlePadding} 0 1,0 -${size.x._value +
    circlePadding * 2},0Z`;

type Props = {
  size: valueXY,
  position: valueXY,
  style: object | number | Array,
  easing: func,
  animationDuration: number,
  animated: boolean,
  circle: boolean,
  onPress: () => void,
};

type State = {
  size: Animated.ValueXY,
  position: Animated.ValueXY,
  canvasSize: ?valueXY,
};

class SvgMask extends Component<Props, State> {
  static defaultProps = {
    animationDuration: 300,
    easing: Easing.linear,
    circle: false,
  };

  constructor(props) {
    super(props);

    this.state = {
      canvasSize: {
        x: windowDimensions.width,
        y: windowDimensions.height,
      },
      size: new Animated.ValueXY(props.size),
      position: new Animated.ValueXY(props.position),
    };

    this.state.position.addListener(this.animationListener);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.position !== nextProps.position || this.props.size !== nextProps.size) {
      this.animate(nextProps.size, nextProps.position);
    }
  }

  animationListener = (): void => {
    const d: string = this.props.circle
      ? circlePath(this.state.size, this.state.position, this.state.canvasSize)
      : path(this.state.size, this.state.position, this.state.canvasSize);
    if (this.mask) {
      this.mask.setNativeProps({ d });
    }
  };

  animate = (size: valueXY = this.props.size, position: valueXY = this.props.position): void => {
    if (this.props.animated) {
      Animated.parallel([
        Animated.timing(this.state.size, {
          toValue: size,
          duration: this.props.animationDuration,
          easing: this.props.easing,
        }),
        Animated.timing(this.state.position, {
          toValue: position,
          duration: this.props.animationDuration,
          easing: this.props.easing,
        }),
      ]).start(() => this.setState({})); // trigger render button
    } else {
      this.state.size.setValue(size);
      this.state.position.setValue(position);
    }
  };

  handleLayout = ({
    nativeEvent: {
      layout: { width, height },
    },
  }) => {
    this.setState({
      canvasSize: {
        x: width,
        y: height,
      },
    });
  };

  render() {
    return (
      <View pointerEvents="box-none" style={this.props.style} onLayout={this.handleLayout}>
        {this.state.canvasSize ? (
          <Svg
            pointerEvents="none"
            width={this.state.canvasSize.x}
            height={this.state.canvasSize.y}
          >
            <AnimatedSvgPath
              ref={(ref) => {
                this.mask = ref;
              }}
              fill="rgba(0, 0, 0, 0.4)"
              fillRule="evenodd"
              strokeWidth={1}
              d={
                this.props.circle
                  ? circlePath(this.state.size, this.state.position, this.state.canvasSize)
                  : path(this.state.size, this.state.position, this.state.canvasSize)
              }
            />
          </Svg>
        ) : null}
        <TouchableWithoutFeedback
          style={{
            position: 'absolute',
            top: this.state.position.y._value,
            left: this.state.position.x._value,
            width: this.state.size.x._value,
            height: this.state.size.y._value,
          }}
          onPress={this.props.onPress}
        >
          <View />
        </TouchableWithoutFeedback>
      </View>
    );
  }
}

export default SvgMask;
