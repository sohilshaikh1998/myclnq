import React, {Component} from 'react'

import {StyleSheet, Text, View, ViewPropTypes} from 'react-native'

import PropTypes from 'prop-types'

import StarRatingView, {StarLog} from './StarRatingView'

const RNViewPropTypes = ViewPropTypes || View.propTypes;
const RNPropTypes = PropTypes || React.PropTypes;
const propTypes = {
    style: RNViewPropTypes.style,
    starStyle: RNViewPropTypes.style, // 自定义星星样式
    readOnly: RNPropTypes.bool, // 是否只读
    continuous: RNPropTypes.bool, // 是否允许滑动打分
    maximumValue: RNPropTypes.number, // 最大值
    minimumValue: RNPropTypes.number, // 最小值
    value: RNPropTypes.number, // 具体数值
    valueToFix: RNPropTypes.number, // 保留几位小数
    spacing: RNPropTypes.number, // 分数
    allowsHalfStars: RNPropTypes.bool, // 是否允许半颗星
    accurateHalfStars: RNPropTypes.bool, // 是否允许精确值
    emptyStarColor: RNPropTypes.string, // 空星填充色
    tintColor: RNPropTypes.string, // 着色(填充色)
    emptyStarImage: RNPropTypes.element, // 空星图片
    halfStarImage: RNPropTypes.element, // 半星图片
    filledStarImage: RNPropTypes.element, // 实星图片
    onStarValueChanged: RNPropTypes.func, // 数值改变时的回调函数
    scoreTextStyle: RNPropTypes.object, // 自定义分数文本样式
    scoreText: RNPropTypes.string, // 分数文本
    dontShowScore: RNPropTypes.bool, // 不显示分数
};

const defaultProps = {
    readOnly: true,
    maximumValue: 5,
    minimumValue: 0,
    value: 0,
    valueToFix: 1,
    spacing: 10,
    allowsHalfStars: false,
    accurateHalfStars: false,
    scoreTextStyle: {marginLeft: 10, color: '#ffb819'},
    scoreText: '分',
};

export default class StarRatingBar extends Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            value: this.props.score || this.props.value,
        }
        StarLog("hello", "star", "log");
    }

    componentWillReceiveProps(nextProps) {
        let value = nextProps.score || nextProps.value;
        if (value !== this.state.value) {
            this.setState({value});
        }
    }

    render() {
        const {starStyle, spacing, maximumValue, scoreTextStyle, scoreText, dontShowScore} = this.props;
        let starWidth = 20;
        if (starStyle && starStyle.width) {
            starWidth = starStyle.width;
        }
        let starViewWidth = (starWidth + spacing) * maximumValue - spacing;
        return <View style={styles.startList}>
            <View style={{width: starViewWidth, overflow: 'hidden', borderWidth: 0, height: 40}}>
                <StarRatingView
                    starStyle={this.props.starStyle}
                    readOnly={this.props.readOnly}
                    allowsHalfStars={this.props.allowsHalfStars}
                    accurateHalfStars={this.props.accurateHalfStars}
                    continuous={this.props.continuous}
                    maximumValue={this.props.maximumValue}
                    minimumValue={this.props.minimumValue}
                    spacing={this.props.spacing}
                    valueToFix={this.props.valueToFix}
                    emptyStarColor={this.props.emptyStarColor}
                    tintColor={this.props.tintColor}
                    emptyStarImage={this.props.emptyStarImage}
                    halfStarImage={this.props.halfStarImage}
                    filledStarImage={this.props.filledStarImage}

                    value={this.state.value}
                    onStarValueChanged={(changedValue) => {
                        this.setState({value: changedValue});
                        this.props.onStarValueChanged && this.props.onStarValueChanged(changedValue);
                    }}
                >
                </StarRatingView>
            </View>
            {dontShowScore ? null : <Text style={scoreTextStyle}> </Text>}
        </View>;
    }
}

const styles = StyleSheet.create({
    startList: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    star: {
        marginRight: 10
    },
});