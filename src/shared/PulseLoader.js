import React from 'react';
import {Animated, Easing, Image, TouchableOpacity, View} from 'react-native';
import PulseAnim from './PulseAnim';
import PropTypes from 'prop-types'
import {AppColors} from "./AppColors";


export default class PulseLoader extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            circles: []
        };

        this.counter = 1;
        this.setInterval = null;
        this.anim = new Animated.Value(1);
    }

    componentDidMount() {
        this.setCircleInterval();
    }

    setCircleInterval() {
        this.setInterval = setInterval(this.addCircle.bind(this), this.props.interval);
        this.addCircle();
    }

    addCircle() {
        this.setState({circles: [...this.state.circles, this.counter]});
        this.counter++;
    }

    onPressIn() {
        Animated.timing(this.anim, {
            toValue: this.props.pressInValue,
            duration: this.props.pressDuration,
            easing: this.props.pressInEasing,
        }).start(() => clearInterval(this.setInterval));
    }

    onPressOut() {
        Animated.timing(this.anim, {
            toValue: 1,
            duration: this.props.pressDuration,
            easing: this.props.pressOutEasing,
        }).start(this.setCircleInterval.bind(this));
    }

    render() {
        const {size, avatar, avatarBackgroundColor, interval} = this.props;

        return (
            <View style={{
                flex: 1,
                backgroundColor: 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center'
            }}>
                {this.state.circles.map((circle) => (
                    <PulseAnim
                        key={circle}
                        {...this.props}
                    />
                ))}

                <TouchableOpacity
                    activeOpacity={1}

                    style={{
                        transform: [{
                            scale: this.anim
                        }]
                    }}
                >
                    <Image
                        source={avatar.uri ? {uri: avatar.uri} : avatar}
                        style={{
                            width: size,
                            height: size,
                            borderRadius: size / 2,
                        }}
                    />
                </TouchableOpacity>


            </View>
        );
    }
}

PulseLoader.propTypes = {
    interval: PropTypes.number,
    size: PropTypes.number,
    pulseMaxSize: PropTypes.number,
    avatarBackgroundColor: PropTypes.string,
    pressInValue: PropTypes.number,
    pressDuration: PropTypes.number,
    borderColor: PropTypes.string,
    backgroundColor: PropTypes.string,
    getStyle: PropTypes.func,
};

PulseLoader.defaultProps = {
    interval: 1000,
    size: 100,
    pulseMaxSize: 250,
    avatar: undefined,
    avatarBackgroundColor: 'white',
    pressInValue: 0.8,
    pressDuration: 150,
    pressInEasing: Easing.in,
    pressOutEasing: Easing.in,
    borderColor: '#D8335B',
    backgroundColor: AppColors.primaryTransparent,
    getStyle: undefined,
};
