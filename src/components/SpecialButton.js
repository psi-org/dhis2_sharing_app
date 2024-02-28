import React, { useState, useEffect } from 'react';

import Button from '@mui/material/Button';
import None from '@mui/icons-material/NotInterested';
import ActionDone from '@mui/icons-material/Done';
import ActionDoneAll from '@mui/icons-material/DoneAll';

const SpecialButton = (props) => {
    const [value, setValue] = useState(0)

    const handleClickButton = () => {
        switch (value) {
            case 0:
                setValue(1)
                props.callBackHandleClick({ "id": props.id, "value": 1, "type": props.type });

                break;
            case 1:
                setValue(2)
                props.callBackHandleClick({ "id": props.id, "value": 2, "type": props.type });

                break;
            case 2:
                setValue(0)
                props.callBackHandleClick({ "id": props.id, "value": 0, "type": props.type });
                break;
        }
    }

    useEffect(() => {
        setValue(props.defaultValue)
    }, [])


    return (
        <div title={props.enabled ? "" : props.title}>
            <Button onClick={() => handleClickButton()} icon={value == 0 ? <None color={props.color} /> : value == 1 ? <ActionDone color={props.color} /> : <ActionDoneAll color={props.color} />} disabled={!props.enabled} />
        </div>
    )
}

export default SpecialButton