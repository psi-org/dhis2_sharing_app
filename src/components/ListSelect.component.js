import React from 'react';

const ListSelect = (props) => {
    const listItemDoubleClicked = (event) => {
        let clickedItemValue = event.target.value

        if (props.onItemDoubleClick) {
            props.onItemDoubleClick(clickedItemValue)
        }
    }

    let options = props.source.map(function (item) {
        return React.createElement(
            'option',
            {
                key: item.value,
                style: { padding: '.25rem' },
                onDoubleClick: listItemDoubleClicked,
                value: item.value
            },
            item.label
        );
    });

    return React.createElement(
        'div',
        { className: 'list-select' },
        React.createElement(
            'select',
            { id: props.id, multiple: "multiple", size: props.size || 15, style: Object.assign({ overflowX: 'auto' }, props.listStyle) },
            options
        )
    );
}

export default ListSelect