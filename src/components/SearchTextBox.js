
import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import appTheme from '../theme';
import Autocomplete from '@mui/material/Autocomplete';

const styles = {
    content: {
        padding: '5%',
        width: '80%'
    },
    contentList: {
        position: 'absolute',
        zIndex: 1,
        backgroundColor: appTheme.palette.canvasColor,
        width: '35%'
    },
    hideList: {
        display: 'none'
    }
}

export const SearchTextBox = (props) => {
    const [value, setValue] = useState([])
    const [textValue, setTextValue] = useState('')

    var keycount = 0

    const handleChangeValue = (event, valueSelected) => {
        setTextValue(event.target.value)

        if (event.target.value == "") {
            setValue([])
        } else {
            props.source(event.target.value).then(res => {
                setValue(res)
            })
        }
    }

    const handleSelectOption = (e, value, reason) => {
        if (reason === "selectOption") {
            props.callBackSelected(value)
            setValue([])
            if (props.showValueSelected == false)
                setTextValue('')
            else
                setTextValue(value.label)
        }
    }

    return (
        <div style={{ position: "relative" }} >
            <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={value}
                sx={{ width: 400 }}
                onInputChange={(e, value) => handleChangeValue(e, value)}
                onChange={(e, value, reason) => handleSelectOption(e, value, reason)}
                renderInput={(params) => <TextField {...params}
                    label={props.disabled ? "Select some option" : props.title}
                    variant="standard"
                    disabled={props.disabled}
                />}
            />
        </div>
    )
}

export default SearchTextBox