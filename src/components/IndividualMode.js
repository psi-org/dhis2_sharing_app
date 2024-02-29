import React, { useState, useEffect } from 'react';
import None from '@mui/icons-material/NotInterested';
import ActionDone from '@mui/icons-material/Done';
import ActionDoneAll from '@mui/icons-material/DoneAll';
import LinearProgress from '@mui/material/LinearProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import More from '@mui/icons-material/MoreVert';


import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TablePagination from '@mui/material/TablePagination';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import appTheme from '../theme';
//dhis2
import i18n from '../locales/index.js'
import { useDataMutation, useDataQuery } from '@dhis2/app-runtime'
import { SharingDialog } from './sharing-dialog';

import { CustomDataProvider } from '@dhis2/app-runtime';

const styles = {
    header: {
        fontSize: 24,
        fontWeight: 300,
        color: appTheme.palette.primary.textColor,
        padding: '24px 0 12px 16px',
    },
    headline: {
        fontSize: 24,
        paddingTop: 16,
        marginBottom: 12,
        fontWeight: 400,
    },
    containterfooter: {
        display: 'grid',
        gridTemplateColumns: 'auto 100px 140px',
        gridTemplateRows: 'auto'
    },
    ItemFooter: {
        fontSize: 14,
        alignSelf: 'center',
        justifySelf: 'end'
    },
    tablerow: {
        wordWrap: 'break-word',
        whiteSpace: 'normal'
    },
    buttonGroup: {
        textAlign: 'center'
    },
    buttonMore: {
        textAlign: 'right',
        with: 50
    },
    divConcentTable: {
    }
};

const queryUsers = {
    results: {
        resource: 'users',
        params: {
            fields: ['id', 'name', 'displayName'],
            paging: false
        }
    }
};

const queryUserGroups = {
    results: {
        resource: 'userGroups',
        params: {
            fields: ['id', 'name', 'displayName'],
            paging: false
        }
    }
};

const sharingsMutation = {
    resource: 'sharing',
    type: 'update',
    params: ({ type, id }) => ({
        type,
        id
    }),
    data: ({ data }) => data
};

export const IndividualMode = (props) => {

    const [openModal, setOpenModal] = useState(false)
    const [userAndGroupsSelected, setUserAndGroupsSelected] = useState({})
    const [messajeError, setMessajeError] = useState("mensaje de error")
    const [rowsPerPage, setRowsPerPage] = useState(50)
    const [page, setPage] = useState(1)
    const [usersAndgroups, setUsersAndgroups] = useState({})

    const { refetch: usersRefetch } = useDataQuery(queryUsers, { lazy: true })
    const { refetch: userGroupsRefetch } = useDataQuery(queryUserGroups, { lazy: true })

    const [mutateSharings] = useDataMutation(sharingsMutation, { lazy: true })

    //query resource Selected
    const getUsersandGroups = async () => {
        let result = { users: [], userGroups: [] };
        try {
            let result_users = await usersRefetch()
            if (result_users.results.users.length > 0)
                result.users = result_users.results.users
            let result_groups = await userGroupsRefetch()
            if (result_groups.results.userGroups.length > 0)
                result.userGroups = result_groups.results.userGroups
            return result
        }
        catch (e) {
            return e
        }
    }

    const setObjectSetting = (info) => {
        let valToSave = {
            meta: {
                allowPublicAccess: (info.data.object.publicAccess === '--------' ? false : true),
                allowExternalAccess: info.data.object.externalAccess
            },
            object: {
                id: info.data.object.id,
                displayName: info.data.object.displayName,
                externalAccess: info.data.object.externalAccess,
                name: info.data.object.name,
                publicAccess: info.data.object.publicAccess,
                userAccesses: info.data.object.userAccesses,
                userGroupAccesses: info.data.object.userGroupAccesses,
            }

        }
        setUserAndGroupsSelected(valToSave.object)

        mutateSharings({
            data: valToSave,
            type: props.resource.key,
            id: userAndGroupsSelected.id
        }).then((res) => {
            if (res.status != "OK")
                setMessajeError(res.message)
            handleOpen(valToSave.object)
            props.handleChangeTabs(undefined, "view", 1)
        })

    }

    const handleOpen = (data) => {

        //fix error
        data.userAccesses = data.userAccesses.map(ua => {
            if (ua.access === "--------") {
                ua.access = "r-------"
            }
            return ua;
        })
        data.userGroupAccesses = data.userGroupAccesses.map(ug => {
            if (ug.access === "--------") {
                ug.access = "r-------"
            }
            return ug;
        })
        setOpenModal(true)
        setUserAndGroupsSelected(data)
    };

    const handleClose = () => {
        setOpenModal(false)
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    };

    const handleChangePage = (e, newpage) => {
        props.handleChangeTabs(undefined, "view", newpage)
        setPage(newpage)
    }

    const waiting = () => {
        let hide = true;
        setTimeout(() => { hide = true }, 5000)
        return (
            <div style={hide ? { display: "none" } : {}}>
                <LinearProgress mode="indeterminate" />
            </div>
        )
    }

    const removeAll = () => {
        let userAndGroupsSelected = {
            userAccesses: [],
            userGroupAccesses: []
        }
        setUserAndGroupsSelected(userAndGroupsSelected)
    }

    //methods
    const resolveAccessMessage = (access, type) => {
        const publicAccessStatus = {
            "rw": "Can find, view and edit",
            "r-": "Can find and view",
            "--": "No Access",
        }

        try {
            let metaDataAccess = access[0] + access[1]
            let DataAccess = access[2] + access[3]

            if (type == "data") {
                return publicAccessStatus[DataAccess];
            } else {
                return publicAccessStatus[metaDataAccess];
            }
        } catch (er) {
            return "No Access"
        }
    }

    const renderResultInTable = () => {
        let keysCount = 0;
        //convert object to array
        let rowRaw = Object.values(props.listObject);
        //
        const funResolvMessage = resolveAccessMessage;

        return rowRaw.map((row) => {
            let lastUG, lastUS
            keysCount++
            //handle last separator
            if (row.userGroupAccesses.length > 0)
                lastUG = row.userGroupAccesses[row.userGroupAccesses.length - 1].id
            else
                lastUG = ""

            if (row.userAccesses.length > 0)
                lastUS = row.userAccesses[row.userAccesses.length - 1].id
            else
                lastUS = ""

            //filter by name ir by filter selected
            //if (((row.displayName.includes(props.searchByName) == true) && (props.filterString.includes(row.id) == true || props.filterString == "")))
            return (<TableRow key={keysCount}>
                <TableCell style={styles.tablerow}>{row.displayName}</TableCell >
                <TableCell style={styles.tablerow}>{funResolvMessage(row.publicAccess, "metadata") == "Can find, view and edit" ? <ActionDoneAll /> : funResolvMessage(row.publicAccess, "metadata") == "Can find and view" ? <ActionDone /> : <None />}</TableCell >
                <TableCell style={styles.tablerow}>{row.externalAccess ? <ActionDone /> : <None />}</TableCell >
                <TableCell style={styles.tablerow}>

                    {row.userGroupAccesses.map((ug) => {
                        if (ug.access == undefined) {
                            ug.access = "--------"
                        }
                        return (
                            <div key={ug.id + "_" + keysCount} style={styles.buttonGroup} title={"METADATA: " + i18n.t(funResolvMessage(ug.access, "metadata")) + " DATA:" + i18n.t(funResolvMessage(ug.access, "data"))}>
                                <div>
                                    {ug.access[1] == "w" ? <ActionDoneAll /> : <ActionDone />}
                                    {ug.access[3] == "w" ? <ActionDoneAll /> : ug.access[2] == "r" ? <ActionDone /> : <None />}
                                </div>
                                <div>{ug.name}</div>
                                {lastUG != ug.id ? <Divider /> : ""}
                            </div>)
                    })
                    }
                </TableCell >
                <TableCell style={styles.tablerow}>
                    {row.userAccesses.map((us) => {
                        if (us.access == undefined) {
                            us.access = "--------"
                        }
                        return (
                            <div key={us.id + "_" + keysCount} style={styles.buttonGroup} title={"METADATA: " + i18n.t(funResolvMessage(us.access, "metadata")) + " DATA:" + i18n.t(funResolvMessage(us.access, "data"))}>
                                <div>
                                    {us.access[1] == "w" ? <ActionDoneAll /> : <ActionDone />}
                                    {us.access[3] == "w" ? <ActionDoneAll /> : us.access[2] == "r" ? <ActionDone /> : <None />}
                                </div>
                                <div>{us.name}</div>
                                {lastUS != us.id ? <Divider /> : ""}
                            </div>)
                    })
                    }

                </TableCell >
                <TableCell style={styles.buttonMore}>
                    <IconButton onClick={() => handleOpen(row)}><More />   </IconButton>
                </TableCell>
            </TableRow>)
        })
    }

    useEffect(() => {
        (async () => {
            setOpenModal(false)
            setUserAndGroupsSelected({})
            setMessajeError("")

            let usersAndgroupsRes = await getUsersandGroups()
            setUsersAndgroups(usersAndgroupsRes);
        })();
    }, [])

    return (
        <div>
            <div style={styles.divConcentTable}>
                {props.pager.total > 0 &&
                    <>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25, 50, 100]}
                            component="div"
                            count={props.pager.total}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />

                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell >{i18n.t("Name")}</TableCell >
                                    <TableCell >{i18n.t("Public Access")}</TableCell >
                                    <TableCell >{i18n.t("External Access")}</TableCell >
                                    <TableCell style={styles.buttonGroup}>{i18n.t("Groups")}</TableCell >
                                    <TableCell style={styles.buttonGroup}>{i18n.t("Users")}</TableCell >
                                    <TableCell style={styles.buttonMore}></TableCell >
                                </TableRow>
                            </TableHead >
                            <TableBody>
                                {Object.keys(props.listObject).length > 0 ? renderResultInTable() : null}
                            </TableBody>
                        </Table>

                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25, 50, 100]}
                            component="div"
                            count={props.pager.total}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </>
                }

                <CustomDataProvider
                    data={{
                        sharing: {
                            meta: {
                                allowExternalAccess: true,
                                allowPublicAccess: true
                            },
                            object: userAndGroupsSelected
                        },
                        'sharing/search': Object.assign({}, usersAndgroups, userAndGroupsSelected)
                    }}
                >
                    {userAndGroupsSelected.id !== undefined && openModal && (
                        <SharingDialog id={userAndGroupsSelected.id} sharingSettingObject={userAndGroupsSelected} onClose={() => handleClose()} type={props.resource.resource} modal={true} callback={setObjectSetting} allowExternalAccess={props.informationResource.authorities.find(a => a.type === "EXTERNALIZE") !== undefined ? true : false} removeAll={removeAll} />
                    )}
                </CustomDataProvider>
            </div>
        </div>
    )
}

export default IndividualMode;