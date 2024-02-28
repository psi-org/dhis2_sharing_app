import React, { useState } from 'react';

//MAterial UI
import TextField from '@mui/material/TextField';
import appTheme from '../theme';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { grey } from '@mui/material/colors';


const styles = {
    container: {
        display: 'grid',
        gridTemplateColumns: '100% 50%',
    },
    item: {
        padding: -1,
        // border: '1px solid red'
    },
    icon: {
        padding: -1,
        justifySelf: 'end',
        // border: '1px solid red'
    },
    iconStyles: {
        marginRight: 24,
    }
}

export const Filter = () => {
    const [value, setValue] = useState('name')

    const handleChange = (event, index, value) => {
        setValue(value)
    };

    const getChildContext = () => {
        return {
            d2: props.d2,
            muiTheme: appTheme
        }
    }

    const renderTextLabel = () => {
        return (
            <section style={styles.container}>
                <div style={styles.item}>
                    {props.d2.i18n.getTranslation(' Search by name')}
                </div>

                <div style={styles.icon}>
                    <OpenInNewIcon className="material-icons" color={grey[400]} />

                </div>
            </section>
        )
    }

    return (
        <TextField
            fullWidth={true}
            hintText={renderTextLabel()}
            floatingLabelText={textlabel}
        />
    )
}

Filter.propTypes = {
    d2: React.PropTypes.object.isRequired,
    label: React.PropTypes.string,
};

Filter.contextTypes = {
    title: React.PropTypes.string,
    muiTheme: React.PropTypes.object
};

Filter.childContextTypes = {
    d2: React.PropTypes.object,
    muiTheme: React.PropTypes.object
};

export default Filter