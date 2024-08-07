/**
 * Created by anooj on 25/06/18.
 */


import React from 'react';
import {Platform, StyleSheet, Text, TouchableHighlight} from 'react-native';
import PropTypes from 'prop-types'
import {moderateScale, verticalScale} from '../utils/Scaling';
import {AppStyles} from '../shared/AppStyles';
import {AppColors} from "../shared/AppColors";

class ChipView extends React.Component {
    static propTypes = {
        height: PropTypes.number,
        width: PropTypes.number,
        chipText: PropTypes.string.isRequired,
        onChipClick: PropTypes.func,
    }
    static defaultProps = {
        height: (40),
        marginTop: (5),
        width: (70),
        marginLeft: (25),
        chipText: ""
    }

    constructor(props) {
        super(props);
        this.props = props;
    }

    render() {
        return (

            <TouchableHighlight style={{
                height: verticalScale(this.props.height),
                width: moderateScale(this.props.width),
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: AppColors.primaryColor,
                borderRadius: (verticalScale(this.props.height)) / 2,
                ...this.props.style
            }}
                                underlayColor='transparent'
                                onPress={this.onChipClick.bind(this)}
            >

                <Text numberOfLines={1} style={styles.specText}>{this.props.chipText}</Text>

            </TouchableHighlight>

        )
    }

    onChipClick() {
        if (this.props.onChipClick != undefined) {
            this.props.onChipClick()
        }
    }


}

const styles = StyleSheet.create({

    spec: {
        width: moderateScale(80),
        borderRadius: 200,
        height: moderateScale(25),
        alignSelf: 'center',
        backgroundColor: AppColors.primaryColor,
        marginTop: moderateScale(10)
    },
    specText: {
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        color: AppColors.whiteColor,
        marginLeft: moderateScale(5),
        marginRight: moderateScale(5),
        fontFamily: AppStyles.fontFamilyRegular,
        marginTop: (Platform.OS === 'ios' ? 3 : 0),
        fontSize: moderateScale(10),

    },
})

export default ChipView;