/**
 * Created by anooj on 25/06/18.
 */


import React from 'react';
import {Platform, StyleSheet, Text, TouchableHighlight} from 'react-native';
import PropTypes from 'prop-types'
import {moderateScale} from '../utils/Scaling';
import {AppStyles} from '../shared/AppStyles';
import {AppColors} from "../shared/AppColors";

class SHButton extends React.Component {
    static propTypes = {
        height: PropTypes.number,
        width: PropTypes.number,
        btnText: PropTypes.string.isRequired,
        btnBackground: PropTypes.string,
        btnTextColor: PropTypes.string,
        btnPressBackground: PropTypes.string,
        onBtnClick: PropTypes.func,
        btnType: PropTypes.oneOf(['normal', 'border-only']).isRequired,
    }
    static defaultProps = {
        height: moderateScale(40),
        width: moderateScale(120),
        btnText: "PROCEED",
        btnType: 'normal',
        btnBackground: AppColors.primaryColor,
        btnPressBackground: AppColors.primaryColor,
        btnTextColor: AppColors.whiteColor
    }

    constructor(props) {
        super(props);
        this.props = props;
    }

    render() {

        var btnStyle = styles.proceedButton;
        switch (this.props.btnType) {
            case 'normal':
                btnStyle = styles.proceedButton;
                break;
            case 'border-only':
                btnStyle = styles.borderBtn;
                break;
        }

        return (

            <TouchableHighlight onPress={this.onBtnClick.bind(this)}
                                style={[btnStyle, {
                                    height: moderateScale(this.props.height),
                                    width: moderateScale(this.props.width),
                                    ...this.props.style
                                }]} underlayColor={this.props.btnPressBackground}>
                <Text allowFontScaling={false} style={[styles.proceedText, {
                    color: this.props.btnTextColor,
                }]}>{this.props.btnText}</Text>
            </TouchableHighlight>

        )
    }

    onBtnClick() {
        if (this.props.onBtnClick != undefined) {
            this.props.onBtnClick()
        }
    }


}

const styles = StyleSheet.create({

    proceedButton: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: AppColors.primaryColor,
        borderRadius: 10,
    },

    proceedText: {
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        fontFamily: AppStyles.fontFamilyRegular,
        fontSize: moderateScale(15),
        marginTop: (Platform.OS === 'ios' ? 4 : 0)
    },
    borderBtn: {
        borderRadius: 10,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: AppColors.whiteColor
    }

})

export default SHButton;
