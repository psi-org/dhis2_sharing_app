import React, { useState, useEffect } from 'react';

//MAterial UI
import TextField from '@mui/material/TextField';
import appTheme from '../theme';

import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import SelectField from '@mui/material/Select';
import InitiallistOptionSearch from '../data/listOptionSearch.json'
//Component
import SearchTextBox from './SearchTextBox';
//
//dhis2
import i18n from '../locales/index.js'
import { useDataMutation, useDataQuery } from '@dhis2/app-runtime'
import { get, post } from '../API/Dhis2.js';
import { QUERY_LIST_OPTION_SEARCH } from '../config/constants.js';

const styles = {
    container: {
        display: 'grid',
        gridTemplateColumns: '30% 30% 40%',
    },
    item: {
        padding: 5

    },
    titleColor: appTheme.palette.primary.settingOptions.title
}

const queryResource = {
    results: {
        resource: 'programs',
        params: ({ valueToSearch }) => ({
            fields: ['id', 'name', 'displayName~rename(label)'],
            filter: [`displayName:like:${valueToSearch}`]
        })
    }
};

const queryListOptionSearch = {
    results: {
        resource: QUERY_LIST_OPTION_SEARCH
    }
};

export const Filter = (props) => {
    const [value, setValue] = useState('name')
    const [valueSelected, setValueSelected] = useState({
        code: '<No value>',
        value: '',
        disabled: true,
        tooltipText: 'Select one filter option'
    })
    const [optionFilter, setOptionFilter] = useState([])
    const [listOptionSearch, setListOptionSearch] = useState([])

    const { refetch: fetchListOptionSearch } = useDataQuery(queryListOptionSearch, {lazy: true});

    const handleChange = (event) => {
        let vSelected = optionFilter.filter(val => val.value == event.target.value)
        setValue(event.target.value)
        if (vSelected.length >= 1)
            setValueSelected(vSelected[0])
        if (vSelected[0].disabled)
            props.handleReturnFilterSelected({})
    };

    const getChildContext = () => {
        return {
            muiTheme: appTheme
        };
    }

    const renderOption = (option) => {
        if (Object.keys(props.filterAvailable).length > 1)
            if (props.filterAvailable.filters.includes(option.value)) {
                return (
                    <MenuItem
                        value={option.value}
                        key={option.value}
                    >
                        {i18n.t(option.code)}
                    </MenuItem>
                )
            }
    }

    const getResourceSelected = async (resource, urlAPI) => {
        let result = {};
        try {
            let res = await get('/' + resource + urlAPI)
            return res
        }
        catch (e) {
            console.error('Could not access to API Resource')
        }
        return result
    }

    const searchOption = async (valueToSearch) => {
        const filter = valueToSearch && valueToSearch !== ''?`&filter=displayName:ilike:${valueToSearch}`:''
        const urlAPI = `?fields=id,name,displayName~rename(label)${filter}`

        return getResourceSelected(valueSelected.value, urlAPI).then(res => {
            return res[valueSelected.value]
        })
    }

    const filterOption = async (filter, resource, id) => {
        const urlAPI = "/" + id + filter
        return getResourceSelected(resource, urlAPI).then(res => {
            return res
        })
    }

    const selectOption = (valueSelected) => {
        filterOption(valueSelected.filter, valueSelected.value, valueSelected.id).then(rawData => {
            props.handleReturnFilterSelected(rawData, valueSelected)
        })
    }
    const handleChangeValue = (event) => {
        props.handlefilterTextChange(event.target.value);
    }

    useEffect(() => {
        // if listOptionSearch.json is empty, get it from dhis2
        fetchListOptionSearch().then(r => {
            console.log(r)
            if (!r?.results) {
                console.log("ya no ingresa aquí")
                setListOptionSearch(InitiallistOptionSearch)
                setOptionFilter(InitiallistOptionSearch.options)
                post('/dataStore/sharingsettingapp/listOptionSearch', InitiallistOptionSearch).then(r => { console.log(r) })
            } else {
                setListOptionSearch(r.results)
                setOptionFilter(r.results.options)
            }
        }).catch(error => {
            console.log(error);
        })
    }, [])

    return (
        <section style={styles.container}>
            <div style={styles.item}>
                <TextField
                    fullWidth={true}
                    label={i18n.t(' Search by name')}
                    variant="standard"
                    onChange={handleChangeValue}
                />
            </div>
            <div style={styles.item}>
                <Box sx={{ minWidth: 120 }}>
                    <FormControl variant="standard" fullWidth>
                        <InputLabel id="selectfilter">
                            {i18n.t('Filter objects related with:')}
                        </InputLabel>
                        <SelectField
                            labelId="selectfilter"
                            defaultValue={props.filterAvailable.filters === "" || props.filterAvailable.filters === undefined ? i18n.t("<No value>") : i18n.t(props.filterAvailable.filters.split(',')[0])}
                            value={value}
                            onChange={handleChange}
                            disabled={props.filterAvailable.filters == "" ? true : false}
                            inputProps={{
                                name: i18n.t('Filter objects related with:'),
                                id: 'uncontrolled-native',
                            }}
                        >
                            {optionFilter.map(renderOption, this)}
                        </SelectField>
                    </FormControl>
                </Box>
            </div>
            <div style={styles.item}>
                <SearchTextBox
                    source={searchOption}
                    title={i18n.t(valueSelected.tooltipText)}
                    callBackSelected={selectOption}
                    color={styles.titleColor}
                    showValueSelected={true}
                    disabled={valueSelected.disabled}
                />
            </div>
        </section>
    )
}

export default Filter