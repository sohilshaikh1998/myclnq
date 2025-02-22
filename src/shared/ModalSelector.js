'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import {
    Modal,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    ViewPropTypes as RNViewPropTypes,
} from 'react-native';

import styles from './style';
import {AppUtils} from "../utils/AppUtils";

const ViewPropTypes = RNViewPropTypes || View.propTypes;

let componentIndex = 0;

const propTypes = {
    data: PropTypes.array,
    onChange: PropTypes.func,
    onModalOpen: PropTypes.func,
    onModalClose: PropTypes.func,
    keyExtractor: PropTypes.func,
    labelExtractor: PropTypes.func,
    visible: PropTypes.bool,
    initValue: PropTypes.string,
    animationType: ['none', 'slide', 'fade'],
    style: ViewPropTypes.style,
    selectStyle: ViewPropTypes.style,
    selectTextStyle: Text.propTypes.style,
    optionStyle: ViewPropTypes.style,
    optionTextStyle: Text.propTypes.style,
    optionContainerStyle: ViewPropTypes.style,
    sectionStyle: ViewPropTypes.style,
    childrenContainerStyle: ViewPropTypes.style,
    touchableStyle: ViewPropTypes.style,
    touchableActiveOpacity: PropTypes.number,
    sectionTextStyle: Text.propTypes.style,
    cancelContainerStyle: ViewPropTypes.style,
    cancelStyle: ViewPropTypes.style,
    cancelTextStyle: Text.propTypes.style,
    overlayStyle: ViewPropTypes.style,
    cancelText: PropTypes.string,
    disabled: PropTypes.bool,
    supportedOrientations: ['portrait', 'landscape'],
    keyboardShouldPersistTaps: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    backdropPressToClose: PropTypes.bool,
    accessible: PropTypes.bool,
    scrollViewAccessibilityLabel: PropTypes.string,
    cancelButtonAccessibilityLabel: PropTypes.string,
    passThruProps: PropTypes.object,
    modalOpenerHitSlop: PropTypes.object,
};

const defaultProps = {
    data: [],
    onChange: () => {
    },
    onModalOpen: () => {
    },
    onModalClose: () => {
    },
    keyExtractor: (item) => item.key,
    labelExtractor: (item) => item.label,
    visible: false,
    initValue: 'Select me!',
    animationType: ['none', 'slide', 'fade'],
    style: {},
    selectStyle: {},
    selectTextStyle: {},
    optionStyle: {},
    optionTextStyle: {},
    optionContainerStyle: {},
    sectionStyle: {},
    childrenContainerStyle: {},
    touchableStyle: {},
    touchableActiveOpacity: 0.2,
    sectionTextStyle: {},
    cancelContainerStyle: {},
    cancelStyle: {},
    cancelTextStyle: {},
    overlayStyle: {},
    cancelText: 'cancel',
    disabled: false,
    supportedOrientations: ['portrait', 'landscape'],
    keyboardShouldPersistTaps: 'always',
    backdropPressToClose: false,
    accessible: false,
    scrollViewAccessibilityLabel: undefined,
    cancelButtonAccessibilityLabel: undefined,
    passThruProps: {},
    modalOpenerHitSlop: {top: 0, bottom: 0, left: 0, right: 0},
};

export default class ModalSelector extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            modalVisible: props.visible,
            selected: props.initValue,
            cancelText: props.cancelText,
            changedItem: undefined,
        };
    }

    componentDidUpdate(prevProps, prevState) {
        let newState = {};
        let doUpdate = false;
        if (prevProps.initValue !== this.props.initValue) {
            newState.selected = this.props.initValue;
            doUpdate = true;
        }
        if (prevProps.visible !== this.props.visible) {
            newState.modalVisible = this.props.visible;
            doUpdate = true;
        }
        if (doUpdate) {
            this.setState(newState);
        }
    }

    onChange = (item) => {
        AppUtils.console("sdffxc345yxbc789", item)
        this.props.onChange(item);
        this.setState({selected: this.props.labelExtractor(item), changedItem: item});
        this.close();
    }

    close = () => {
        this.props.onModalClose();
        this.setState({
            modalVisible: false,
        });
    }

    open = () => {
        this.props.onModalOpen();
        this.setState({
            modalVisible: true,
            changedItem: undefined,
        });
    }

    renderSection = (section) => {
        return (
            <View key={this.props.keyExtractor(section)} style={[styles.sectionStyle, this.props.sectionStyle]}>
                <Text
                    style={[styles.sectionTextStyle, this.props.sectionTextStyle]}>{this.props.labelExtractor(section)}</Text>
            </View>
        );
    }

    renderOption = (option, isLastItem) => {
        return (
            <TouchableOpacity
                key={this.props.keyExtractor(option)}
                onPress={() => this.onChange(option)}
                activeOpacity={this.props.touchableActiveOpacity}
                accessible={this.props.accessible}
                accessibilityLabel={option.accessibilityLabel || undefined}
                {...this.props.passThruProps}
            >
                <View style={[styles.optionStyle, this.props.optionStyle, isLastItem && {borderBottomWidth: 0}]}>
                    <Text
                        style={[styles.optionTextStyle, this.props.optionTextStyle]}>{this.props.labelExtractor(option)}</Text>
                </View>
            </TouchableOpacity>);
    }

    renderOptionList = () => {
        let options = this.props.data.map((item, index) => {
            if (item.section) {
                return this.renderSection(item);
            }
            return this.renderOption(item, index === this.props.data.length - 1);
        });

        const closeOverlay = this.props.backdropPressToClose;

        return (
            <TouchableWithoutFeedback key={'modalSelector' + (componentIndex++)} accessible={false} onPress={() => {
                closeOverlay && this.close();
            }}>
                <View style={[styles.overlayStyle, this.props.overlayStyle]}>
                    <View style={[styles.optionContainer, this.props.optionContainerStyle]}>
                        <ScrollView keyboardShouldPersistTaps={this.props.keyboardShouldPersistTaps}
                                    accessible={this.props.accessible}
                                    accessibilityLabel={this.props.scrollViewAccessibilityLabel}>
                            <View style={{paddingHorizontal: 10}}>
                                {options}
                            </View>
                        </ScrollView>
                    </View>
                    <View style={[styles.cancelContainer, this.props.cancelContainerStyle]}>
                        <TouchableOpacity onPress={this.close} activeOpacity={this.props.touchableActiveOpacity}
                                          accessible={this.props.accessible}
                                          accessibilityLabel={this.props.cancelButtonAccessibilityLabel}>
                            <View style={[styles.cancelStyle, this.props.cancelStyle]}>
                                <Text
                                    style={[styles.cancelTextStyle, this.props.cancelTextStyle]}>{this.props.cancelText}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>);
    }

    renderChildren = () => {

        if (this.props.children) {
            return this.props.children;
        }
        return (
            <View style={[styles.selectStyle, this.props.selectStyle]}>
                <Text style={[styles.selectTextStyle, this.props.selectTextStyle]}>{this.state.selected}</Text>
            </View>
        );
    }

    render() {

        const dp = (
            <Modal
                transparent={true}
                style={{backgroundColor: "#FFFFFF"}}
                ref={element => this.model = element}
                supportedOrientations={this.props.supportedOrientations}
                visible={this.state.modalVisible}
                onRequestClose={this.close}
                animationType={this.props.animationType}
                onDismiss={() => this.state.changedItem && this.props.onChange(this.state.changedItem)}
            >
                {this.renderOptionList()}
            </Modal>
        );

        return (
            <View style={this.props.style} {...this.props.passThruProps}>
                {dp}
                <TouchableOpacity hitSlop={this.props.modalOpenerHitSlop}
                                  activeOpacity={this.props.touchableActiveOpacity} style={this.props.touchableStyle}
                                  onPress={this.open} disabled={this.props.disabled}>
                    <View style={this.props.childrenContainerStyle} pointerEvents="none">
                        {this.renderChildren()}
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}

ModalSelector.propTypes = propTypes;
ModalSelector.defaultProps = defaultProps;
