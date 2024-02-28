import React, { useState, useEffect } from 'react';

//Material UI
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import User from '@mui/icons-material/Person';
import Group from '@mui/icons-material/Group';
import Clear from '@mui/icons-material/Clear';

//Component
import SearchTextBox from './SearchTextBox';
import appTheme from '../theme';
import SpecialButton from './SpecialButton';
//
import { get } from '../API/Dhis2.js';
import i18n from '../locales/index.js'

const styles = {
    paper: {
        height: 200,
        overflow: 'auto',
        width: '90%',
        margin: 20,
        textAlign: 'center',
        display: 'inline-block',
    },
    textBox: {
        width: '90%',
        background: appTheme.palette.primary.canvasColor,
        margin: 20,
        position: "relative"
    },
    columnForEditButton: {
        width: '15%'
    },
    columnForMain: {
        width: '40%'
    },
    columnIcon: {
        width: 10
    },
    iconColor: appTheme.palette.primary.settingOptions.icon
}

export const ListGroups = (props) => {
    const [sharingOption, setSharingOption] = useState({
        userAccesses: [],
        userGroupAccesses: []
    })
    const [idSelectedforFilter, setIdSelectedforFilter] = useState([])

    var keyCount = 0

    //API Query
    //query resource Selected
    const getResourceSelected = async (urlAPI) => {
        let result = {}
        try {
            let res = await get(urlAPI)
            return res
        }
        catch (e) {
            console.error('Could not access to API Resource')
        }
        return result
    }

    const searchUserGroups = async (valuetoSearch) => {
        return getResourceSelected("sharing/search?key=" + valuetoSearch).then(res => {
            let users = []
            let groups = []
            res.users.forEach((user) => {
                //filter that this object was been previously selected
                if (!idSelectedforFilter.includes(user.id))
                    users.push({
                        id: user.id,
                        displayName: user.displayName,
                        data: { type: 'user' }
                    })
            })
            res.userGroups.forEach((group) => {
                //filter that this object was been previously selected
                if (!idSelectedforFilter.includes(group.id))
                    groups.push({
                        id: group.id,
                        displayName: group.displayName,
                        data: { type: 'group' }
                    })
            })
            return users.concat(groups);
        })
    }

    //handle
    //change access each click
    const HandleClickButton = (data) => {
        let access = { 0: "--", 1: "r-", 2: "rw" }
        let { userAccesses, userGroupAccesses } = sharingOption
        switch (data.type) {
            case "USERMETADATA":
                userAccesses = sharingOption.userAccesses.map((user) => {
                    if (user.id == data.id) {
                        user.access = access[data.value] + user.access.substring(2, 4) + "----"
                    }
                    return user
                })
                break
            case "GROUPMETADATA":
                userGroupAccesses = sharingOption.userGroupAccesses.map((group) => {
                    if (group.id == data.id) {
                        group.access = access[data.value] + group.access.substring(2, 4) + "----"
                    }
                    return group
                })
                break
            case "USERDATA":
                userAccesses = sharingOption.userAccesses.map((user) => {
                    if (user.id == data.id) {
                        user.access = user.access.substring(0, 2) + access[data.value] + "----"
                    }
                    return user
                })
                break
            case "GROUPDATA":
                userGroupAccesses = sharingOption.userGroupAccesses.map((group) => {
                    if (group.id == data.id) {
                        group.access = group.access.substring(0, 2) + access[data.value] + "----"
                    }
                    return group
                })
                break
        }
        setSharingOption({ userAccesses, userGroupAccesses })
    }

    const handleRemoveItem = (id) => {
        setSharingOption({
            userAccesses: sharingOption.userAccesses.filter((user) => {
                if (user.id != id)
                    return (user)
            }), userGroupAccesses: sharingOption.userGroupAccesses.filter((group) => {
                if (group.id != id)
                    return (group)
            })
        })

        //remove filter
        var i = idSelectedforFilter.indexOf(id)
        if (i !== -1) {
            idSelectedforFilter.splice(i, 1)
            setIdSelectedforFilter(idSelectedforFilter)
        }
    }

    const SelectUserOrGroup = (valueSelected) => {
        idSelectedforFilter.push(valueSelected.id)
        setIdSelectedforFilter(idSelectedforFilter)
        if (valueSelected.data.type == 'user') {
            sharingOption.userAccesses.push(
                {
                    access: "--------",
                    displayName: valueSelected.displayName,
                    id: valueSelected.id,
                    name: valueSelected.displayName
                }
            )
        } else {
            sharingOption.userGroupAccesses.push(
                {
                    access: "--------",
                    displayName: valueSelected.displayName,
                    id: valueSelected.id,
                    name: valueSelected.displayName
                }
            )
        }
        setSharingOption(sharingOption)
    }

    useEffect(() => {
        props.GroupSelected(sharingOption);
    }, [sharingOption])

    useEffect(() => {
        setSharingOption(props.currentSelected)
        //previus Selected
        props.currentSelected.userAccesses.forEach((obj) => {
            idSelectedforFilter.push(obj.id)
        })
        props.currentSelected.userGroupAccesses.forEach((obj) => {
            idSelectedforFilter.push(obj.id)
        })
        //update state
        setIdSelectedforFilter(idSelectedforFilter)
    }, [])

    return (
        <div style={{ position: 'relative' }} >
            <div style={styles.paper}>
                <Table>

                    <TableHead displaySelectAll={false} adjustForCheckbox={props.Enabledchecked}>
                        <TableRow>

                            <TableCell columnNumber={2} style={styles.columnForMain} >{i18n.t("TABLE_USER_NAME")}</TableCell>
                            <TableCell style={styles.columnForEditButton}>{i18n.t("TABLE_METADATA_ACCESS")}</TableCell>
                            <TableCell style={styles.columnForEditButton}> {i18n.t("TABLE_DATA_ACCESS")}</TableCell>
                            <TableCell style={styles.columnForEditButton}></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody displayRowCheckbox={false} showRowHover={true}>
                        {
                            sharingOption.userAccesses.map((option) => {
                                keyCount++;
                                let access = { "--": 0, "r-": 1, "rw": 2 }
                                let AccessMetadata = access[option.access.substring(0, 2)];
                                let AccessData = access[option.access.substring(2, 4)];

                                return (
                                    <TableRow key={option.id + "_" + keyCount}>
                                        <TableCell style={styles.columnIcon}><User color={styles.iconColor} /></TableCell>
                                        <TableCell><span style={{ textColor: styles.iconColor }}>{option.displayName}</span></TableCell>
                                        <TableCell style={styles.columnForEditButton}> <SpecialButton id={option.id} color={styles.iconColor} callBackHandleClick={HandleClickButton} type={"USERMETADATA"} enabled={true} defaultValue={AccessMetadata} /> </TableCell>
                                        <TableCell style={styles.columnForEditButton}>
                                            <SpecialButton id={option.id} color={styles.iconColor} callBackHandleClick={HandleClickButton} type={"USERDATA"} enabled={props.resource.sharingData} defaultValue={AccessData} title={i18n.t("MESSAGE_DISABLED_DATABUTTON")} />
                                        </TableCell>
                                        <TableCell style={styles.columnForEditButton}>
                                            <Button
                                                onClick={() => handleRemoveItem(option.id)}
                                                icon={<Clear color={styles.iconColor} />}
                                            />
                                        </TableCell>
                                    </TableRow>
                                )
                            })}

                        {
                            sharingOption.userGroupAccesses.map((option) => {
                                let access = { "--": 0, "r-": 1, "rw": 2 }
                                let AccessMetadata = access[option.access.substring(0, 2)];
                                let AccessData = access[option.access.substring(2, 4)];
                                return (
                                    <TableRow key={option.id + "_" + keyCount}>
                                        <TableCell style={styles.columnIcon}><Group color={styles.iconColor} /></TableCell>
                                        <TableCell><span style={{ textColor: styles.iconColor }}>{option.displayName}</span></TableCell>
                                        <TableCell style={styles.columnForEditButton}> <SpecialButton id={option.id} color={styles.iconColor} callBackHandleClick={HandleClickButton} type={"GROUPMETADATA"} enabled={true} defaultValue={AccessMetadata} /> </TableCell>
                                        <TableCell style={styles.columnForEditButton}>
                                            <SpecialButton id={option.id} color={styles.iconColor} callBackHandleClick={HandleClickButton} type={"GROUPDATA"} enabled={props.resource.sharingData} defaultValue={AccessData} title={i18n.t("MESSAGE_DISABLED_DATABUTTON")} />
                                        </TableCell>
                                        <TableCell style={styles.columnForEditButton}>
                                            <Button
                                                onClick={() => handleRemoveItem(option.id)}
                                                icon={<Clear color={styles.iconColor} />}
                                            />
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                    </TableBody>
                </Table>
            </div>
            <div style={styles.textBox}>
                <SearchTextBox
                    source={searchUserGroups}
                    title={i18n.t("TITLE_SEARCH_GROUP")}
                    callBackSelected={SelectUserOrGroup}
                    color={styles.iconColor}
                    showValueSelected={false}
                    disabled={false}
                />
            </div>
        </div>
    )
}

export default ListGroups