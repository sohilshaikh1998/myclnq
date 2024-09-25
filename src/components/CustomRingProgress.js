import React, { Component } from 'react';
import { View, Easing, Text } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated from 'react-native-reanimated';
import { AppColors } from '../shared/AppColors';

const { Value, interpolate, timing } = Animated;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// class CustomRingProgress extends Component {
//   constructor(props) {
//     super(props);

//     this.radius = this.props.radius || 100;
//     this.strokeWidth = this.props.strokeWidth || 35;
//     this.progress = this.props.progress;
//     this.percentage = this.props.percentage;
//     this.innerRadius = this.radius - this.strokeWidth / 2;
//     this.circumference = 2 * Math.PI * this.innerRadius;

//     this.fill = new Value(0);

//     this.circleDefaultProps = {
//       r: this.innerRadius,
//       cx: this.radius,
//       cy: this.radius,
//       originX: this.radius,
//       originY: this.radius,
//       strokeWidth: this.strokeWidth,
//       strokeLinecap: 'round',
//       rotation: '-90',
//     };
//   }

//   componentDidMount() {
//     this.animateProgress(this.props.progress);
//   }

//   componentDidUpdate(prevProps) {
//     if (prevProps.progress !== this.props.progress) {
//       this.animateProgress(this.props.progress);
//     }
//   }

//   animateProgress(progress) {
//     timing(this.fill, {
//       toValue: progress,
//       duration: 1500,
//       easing: Easing.inOut(Easing.ease),
//     }).start();
//   }

//   render() {
//     const strokeDashoffset = interpolate(this.fill, {
//       inputRange: [0, 1],
//       outputRange: [this.circumference, 0],
//     });

//     const angle = this.fill.interpolate({
//       inputRange: [0, 1],
//       outputRange: [0, 2 * Math.PI],
//     });

//     const iconX = this.fill.interpolate({
//       inputRange: [0, 1],
//       outputRange: [this.radius, this.radius + this.innerRadius * Math.cos(2 * Math.PI * this.props.progress - Math.PI / 2)],
//     });

//     const iconY = this.fill.interpolate({
//       inputRange: [0, 1],
//       outputRange: [this.radius, this.radius + this.innerRadius * Math.sin(2 * Math.PI * this.props.progress - Math.PI / 2)],
//     });

//     const animatedStyle = {
//       position: 'absolute',
//       left: iconX,
//       top: iconY,
//       transform: [
//         { translateX: -this.strokeWidth * 0.65 }, // Half of icon size to center it
//         { translateY: -this.strokeWidth * 0.8 }, // Half of icon size to center it
//       ],
//     };

//     return (
//       <View
//         style={{
//           width: this.radius * 2,
//           height: this.radius * 2,
//           alignSelf: 'center',
//         }}
//       >
//         <Svg>
//           <Defs>
//             <LinearGradient id="gradientStroke" x1="0%" y1="0%" x2="100%" y2="100%">
//               <Stop offset="0%" stopColor={AppColors.checkTickRed} stopOpacity={1} />
//               <Stop offset="100%" stopColor={AppColors.checkTickRed} stopOpacity={0.1} />
//             </LinearGradient>
//           </Defs>
//           {/* Background */}
//           <Circle {...this.circleDefaultProps} opacity={0.2} stroke="#EE0F55" />
//           {/* Foreground with Gradient */}
//           <AnimatedCircle
//             {...this.circleDefaultProps}
//             stroke="url(#gradientStroke)"
//             strokeDasharray={`${this.circumference}`}
//             strokeDashoffset={strokeDashoffset}
//           />
//         </Svg>

//         <Animated.View style={animatedStyle}>
//           <View
//             style={{
//               width: this.strokeWidth * 0.9,
//               height: this.strokeWidth * 0.9,
//               backgroundColor: AppColors.redTrackColor,
//               position: 'absolute',
//               alignSelf: 'center',
//               top: this.strokeWidth * 0.05,

//               borderRadius: 100,
//               alignItems: 'center',
//               justifyContent: 'center',
//             }}
//           >
//             <Text style={{ color: AppColors.whiteColor, fontSize: 8 }}>{this.percentage}%</Text>
//           </View>
//         </Animated.View>
//       </View>
//     );
//   }
// }

class CustomRingProgress extends Component {
  constructor(props) {
    super(props);

    this.radius = this.props.radius || 100;
    this.strokeWidth = this.props.strokeWidth || 35;
    this.progress = this.props.progress;
    this.percentage = this.props.percentage;
    this.trackColor = this.props.trackColor;

    this.innerRadius = this.radius - this.strokeWidth / 2;
    this.circumference = 2 * Math.PI * this.innerRadius;

    this.fill = new Value(0);

    this.circleDefaultProps = {
      r: this.innerRadius,
      cx: this.radius,
      cy: this.radius,
      originX: this.radius,
      originY: this.radius,
      strokeWidth: this.strokeWidth,
      stroke: this.trackColor,
      strokeLinecap: 'round',
      rotation: '-90',
    };
  }

  componentDidMount() {
    this.animateProgress(this.props.progress);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.progress !== this.props.progress) {
      this.animateProgress(this.props.progress);
    }
  }

  animateProgress(progress) {
    timing(this.fill, {
      toValue: progress,
      duration: 1500,
      easing: Easing.inOut(Easing.ease),
    }).start();
  }

  render() {
    const strokeDashoffset = interpolate(this.fill, {
      inputRange: [0, 1],
      outputRange: [this.circumference, 0],
    });

    return (
      <View
        style={{
          width: this.radius * 2,
          height: this.radius * 2,
          alignSelf: 'center',
        }}
      >
        <Svg>
          <Defs>
            <LinearGradient id="gradientStroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={this.trackColor} stopOpacity={1} />
              <Stop offset="100%" stopColor={this.trackColor} stopOpacity={0.1} />
            </LinearGradient>
          </Defs>
          {/* Background */}
          <Circle {...this.circleDefaultProps} opacity={0.2} stroke="#EE0F55" />
          {/* Foreground with Gradient */}
          <AnimatedCircle
            {...this.circleDefaultProps}
            stroke="url(#gradientStroke)"
            strokeDasharray={`${this.circumference}`}
            strokeDashoffset={strokeDashoffset}
          />
        </Svg>

        <View
          style={{
            width: this.strokeWidth * 0.9,
            height: this.strokeWidth * 0.9,
            backgroundColor: AppColors.redTrackColor,
            position: 'absolute',
            alignSelf: 'center',
            top: this.strokeWidth * 0.05,

            borderRadius: 100,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: AppColors.whiteColor, fontSize: 8 }}>{this.percentage}%</Text>
        </View>
      </View>
    );
  }
}

export default CustomRingProgress;
