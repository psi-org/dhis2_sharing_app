import React, { useState, useEffect } from 'react'
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
//dhis2
import { CustomDataProvider } from '@dhis2/app-runtime';
import { Transfer } from '@dhis2-ui/transfer';
import { SharingDialog } from './sharing-dialog';

import Avatar from '@mui/material/Avatar';

import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

//Component
import ListSelect from './ListSelect.component';
import appTheme from '../theme';
import IndividualSharingSetting from './IndividualSharingSetting';
import SpecialButton from './SpecialButton';
//dhis2
import i18n from '../locales/index.js';
import { post, get } from '../API/Dhis2.js';
import { value } from 'jsonpath';


const styles = {
    list: {
        border: "none",
        fontFamily: "Roboto",
        fontSize: 13,
        height: "250px",
        minHeight: "50px",
        outline: "none",
        width: "100%",
        overflowX: 'auto'
    },
    containterList: {
        margin: 20,
        display: 'grid',
        gridTemplateColumns: '100%',
        gridTemplateRows: 'auto'
    },
    containterBtnAcction: {
        display: 'grid',
        gridTemplateColumns: '42% 10% 42% 6%',
        gridTemplateRows: 'auto'
    },
    containterStrategy: {
        display: 'grid',
        gridTemplateColumns: '100%',
        gridTemplateRows: 'auto',
        height: 500
    },
    ItemsStrategy: {
        alignSelf: 'left',
        placeSelf: 'left'
    },
    ItemsList: {
        alignSelf: 'center'
    },
    ItemMiddleButton: {
        alignSelf: 'center',
        placeSelf: 'center'
    },
    ButtonSelect: {
        margin: 5
    },
    ButtonRightAling: {
        margin: 5,
        justifySelf: 'end'
    },
    ButtonLeftAling: {
        margin: 5,
        justifySelf: 'start'
    },
    ButtonActived: {
        backgroundColor: appTheme.palette.primary.accent1Color,
        textColor: appTheme.palette.primary.alternateTextColor
    },
    iconColor: appTheme.palette.primary.settingOptions.icon,
    papers: {
        height: 480,
        width: '90%',
        margin: 20,
        padding: 30,
        textAlign: 'left',
        display: 'inline-block',
        paddingBottom: 100
    },
    subtitles: {
        fontSize: '100%',
        fontWeight: 'bold'

    },
    bodypaper: {
        margin: 20
    },
    bodypaper2: {
        display: 'grid',
        gridTemplateColumns: '70% 30%',
        gridTemplateRows: 'auto',
        margin: 20
    },
    SwitchExternal: {
        marginRight: 50,
        marginLeft: 20
    },
    divConcentTable: {
        height: 400,
        overflow: 'auto'
    },
    errorMessaje: {
        color: appTheme.palette.primary.error
    }

}

export const BulkMode = (props) => {

    const [assingall, setAssingall] = useState(false)
    const [ExternalAccess, setExternalAccess] = useState(false)
    const [finished, setFinished] = useState(false)
    const [loading, setLoading] = useState(false)
    const [messajeError, setMessajeError] = useState("")
    const [messajeSuccessful, setMessajeSuccessful] = useState({})
    const [objectAvailable, setObjectAvailable] = useState([])
    const [objectSelected, setObjectSelected] = useState([])
    const [objectSelectedview, setObjectSelectedview] = useState([])
    const [openModal, setOpenModal] = useState(false)
    const [page, setPage] = useState(1)
    const [progress, setProgress] = useState(0)
    const [PublicAccess, setPublicAccess] = useState(0)
    const [stepIndex, setStepIndex] = useState(0)
    const [togSelected, setTogSelected] = useState("overwrite")
    const [usersAndgroups, setUsersAndgroups] = useState()
    const [userAndGroupsSelected, setUserAndGroupsSelected] = useState(
        {
            userAccesses: [],
            userGroupAccesses: []
        }
    )

    //query resource Selected
    const setResourceSelected = async (urlAPI, Payload) => {
        try {
            let res = await post(urlAPI, Payload)
            return res;
        }
        catch (e) {
            return (e)
        }
    }

    const removeAll = () => {
        let userAndGroupsSelected = {
            userAccesses: [],
            userGroupAccesses: []
        }
        setUserAndGroupsSelected(userAndGroupsSelected)
    }

    const setObjectSetting = ({ data }) => {
        setUserAndGroupsSelected(data.object)
    }

    //query resource Selected
    const getUsersandGroups = async () => {
        let api_users = "/users?fields=id,name,displayName&paging=false"
        let api_usersgroups = "/userGroups?fields=id,name,displayName&paging=false"
        let result = { users: [], userGroups: [] }
        try {
            let result_users = await get(api_users)
            if (result_users.users.length > 0)
                result.users = result_users.users
            let result_groups = await get(api_usersgroups)
            if (result_groups.userGroups.length > 0)
                result.userGroups = result_groups.userGroups
            return result
        }
        catch (e) {
            return e
        }
    }

    const saveSetting = () => {
        setStepIndex(stepIndex + 1)
        SendInformationAPI(0, [], 0, 0)
        //setTimeout(()=>{SendInformationAPI()  }, 3000);
    }

    const SendInformationAPI = (index, obImported, Imported, noImported) => {
        let access = { 0: "--", 1: "r-", 2: "rw" };
        // let obImported = [];
        // let Imported=0;
        // let noImported=0;
        let obj = objectSelected[index];
        //objectSelected.forEach((obj, index) => {
        let stringUserPublicAccess = access[PublicAccess] + "------";
        let userAccesses = userAndGroupsSelected.userAccesses;
        let userGroupAccesses = userAndGroupsSelected.userGroupAccesses;
        //Merge the current setting ---
        if (togSelected == "keep") {
            userAccesses = userAccesses.concat(obj.userAccesses),
                userGroupAccesses = userGroupAccesses.concat(obj.userGroupAccesses)
        }

        let valToSave = {
            meta: {
                allowPublicAccess: (PublicAccess == 0 ? false : true),
                allowExternalAccess: ExternalAccess
            },
            object: {
                id: obj.value,
                displayName: obj.label,
                externalAccess: ExternalAccess,
                name: obj.label,
                publicAccess: stringUserPublicAccess,
                userAccesses,
                userGroupAccesses
            }

        }
        setResourceSelected("/sharing?type=" + props.resource.key + "&id=" + obj.value, valToSave).then(res => {
            if (res.status == "OK") {
                Imported++
            }
            else {
                noImported++
            }
            obImported.push({ label: obj.label, status: res.status, message: res.message })
            if (index == objectSelected.length - 1) {

                setMessajeSuccessful(
                    {
                        numImported: Imported,
                        numNoImported: noImported,
                        obImported
                    })
                setStepIndex(stepIndex + 1)
                setFinished(stepIndex >= 2)

            }
            else {
                setProgress(index)
            }
            SendInformationAPI(index + 1, obImported, Imported, noImported)
        }).catch(er => {
            noImported++;
            console.log("Error Interno >", er)
        });

        //})

    }

    const handleNext = () => {
        if ((objectSelected.length > 0 && stepIndex == 0) || (userAndGroupsSelected.userAccesses.length + userAndGroupsSelected.userGroupAccesses.length > 0 && stepIndex == 1)) {
            setStepIndex(stepIndex + 1)
            setFinished(stepIndex >= 3)
            setMessajeError("")
        }
        else {
            setMessajeError(i18n.t("Select at least one object, user or group"))
        }
    }

    const handlePrev = () => {
        if (stepIndex > 0) {
            setStepIndex(stepIndex - 1)
        }
    }

    const handleRemoveAll = () => {
        let aList = objectAvailable

        for (let k = 0; k < aList.length; k++) {
            aList[k].visible = true
        }

        setObjectAvailable(aList)
        setObjectSelected([])
    }

    const handleSelectAll = () => {
        setLoading(true)
        setAssingall(true)
        props.reloadData("all")
    }

    const handleList = (values) => {
        //Add or remove Object Selected
        let nList = []

        let userAndGroupsSelected = {
            userAccesses: [],
            userGroupAccesses: []
        }

        if (values.objectAvailable == undefined) {
            values.objectAvailable = objectAvailable
        } else if (values.objectAvailable.length < objectAvailable.length) {
            values.objectAvailable = objectAvailable
        }

        if (values.selected.length > 0) {
            values.selected.forEach((val, inx) => {
                try {
                    let obSelected = values.objectAvailable.find(x => x.value === val)
                    //add access to all object selected in the list, only one for user or group
                    let users = obSelected.userAccesses
                    let groups = obSelected.userGroupAccesses

                    users.forEach((user) => {
                        let _user = userAndGroupsSelected.userAccesses.map(u => u.id).indexOf(user.id)
                        if (_user === -1) {
                            //fix error in legacy data
                            if (user.access === "--------") {
                                user.access = "r-------"
                            }
                            userAndGroupsSelected.userAccesses.push(user)
                        }
                        else {
                            if (userAndGroupsSelected.userAccesses[_user].access === "r-------") {
                                userAndGroupsSelected.userAccesses[_user].access = "r-------"
                            }
                        }
                    })

                    groups.forEach((group) => {
                        let _group = userAndGroupsSelected.userGroupAccesses.map(g => g.id).indexOf(group.id)
                        if (_group === -1) {
                            //fix error in legacy data
                            if (group.access === "--------") {
                                group.access = "r-------"
                            }
                            userAndGroupsSelected.userGroupAccesses.push(group)
                        }
                        else {
                            if (userAndGroupsSelected.userGroupAccesses[_group].access === "r-------") {
                                userAndGroupsSelected.userGroupAccesses[_group].access = "r-------"
                            }
                        }
                    })


                    nList.push(obSelected);
                    if (inx === values.selected.length - 1) {
                        setObjectSelectedview(values.selected)
                        setObjectSelected(nList)
                        setMessajeError("")
                        setUserAndGroupsSelected(userAndGroupsSelected)
                    }
                } catch (e) {
                    console.log(e)
                }
            })
        }
        else {

            setObjectSelectedview(values.selected)
            setObjectSelected(nList)
            setMessajeError("")
            setUserAndGroupsSelected(userAndGroupsSelected)

        }
    }

    const handleListSelected = (list, CallBackFnSelected) => {
        const listSelected = document.getElementById(list).selectedOptions
        for (let option = 0; option < listSelected.length; option++) {
            CallBackFnSelected(listSelected[option].value)
        }
    }

    const HandleClickButton = (data) => {
        let access = { "--": 0, "r-": 1, "rw": 2 }
        setPublicAccess(data.value)
    }

    const handleClose = () => {
        setOpenModal(false)
    }

    const handleOpen = () => {
        setOpenModal(true)
    }

    const fillListObject = (listObject) => {
        //convert object to array
        const rowRaw = Object.values(listObject)
        return rowRaw.map((row) => {
            return (
                {
                    label: row.displayName,
                    value: row.id, visible: true,
                    externalAccess: row.externalAccess,
                    publicAccess: row.publicAccess,
                    userAccesses: row.userAccesses,
                    userGroupAccesses: row.userGroupAccesses
                }
            )
        })
    }

    const handleTogle = (event) => {
        if (event == togSelected)
            if (event == 'keep')
                event = 'overwrite'
            else
                event = 'keep'

        setTogSelected(event)
    }

    const handleExternalAccess = () => {
        if (ExternalAccess)
            setExternalAccess(false)
        else
            setExternalAccess(true)

    }

    const exitEditMode = () => {
        setObjectSelected([])
        setUserAndGroupsSelected({
            userAccesses: [],
            userGroupAccesses: []
        })
        setPublicAccess(0)
        setExternalAccess(false)
        setStepIndex(0)
        setFinished(false)

        handleRemoveAll()
        props.handleChangeTabs(undefined, "view", 1)
    }

    const GroupSelected = (selected) => {
        setUserAndGroupsSelected(selected)
    }

    const onEndReachedTransfer = () => {
        setLoading(true)
        props.reloadData(page)
    }

    const getStepContent = (stepIndex) => {
        switch (stepIndex) {
            case 0:
                return (
                    <div>
                        <div style={styles.containterList}>

                            <Transfer
                                onChange={handleList}
                                options={objectAvailable}
                                selected={objectSelectedview}
                                onEndReached={onEndReachedTransfer}
                                loading={loading}
                            />
                        </div>
                        <div style={styles.containterBtnAcction}>
                            <div style={styles.ButtonLeftAling}>
                                <Button onClick={handleSelectAll} labelColor={styles.ButtonActived.textColor} backgroundColor={styles.ButtonActived.backgroundColor} style={styles.ButtonSelect} variant="outlined">{i18n.t(" ASSING All (") + props.pager.total + ") →"}</Button>
                            </div>
                        </div>

                    </div>
                )
            case 1:
                return (

                    <div style={styles.containterStrategy}>

                        <Paper style={styles.papers}>
                            <div style={styles.subtitles}>{i18n.t("Strategy to save Sharing Setting to all object selected")}</div>
                            <Divider />
                            <div style={styles.bodypaper}>
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
                                    <div style={{ height: 400, maxHeight: 400, overflowX: 'hidden', overflowY: 'auto' }}>
                                        <SharingDialog id={userAndGroupsSelected.id} sharingSettingObject={userAndGroupsSelected} onClose={() => handleClose()} type={props.resource.resource} modal={false} callback={setObjectSetting} allowExternalAccess={props.informationResource.authorities.find(a => a.type === "EXTERNALIZE") !== undefined ? true : false} removeAll={removeAll} />
                                    </div>
                                </CustomDataProvider>
                                <FormGroup>
                                    <FormControlLabel control={<Switch
                                        defaultchecked={true}
                                        onChange={() => handleTogle("overwrite")}
                                        checked={(togSelected == "overwrite" ? true : false)}
                                    />} label={i18n.t("Overwrite Sharing settings")} />
                                    <FormControlLabel control={<Switch
                                        onChange={() => handleTogle("keep")}
                                        checked={(togSelected == "keep" ? true : false)}
                                    />} label={i18n.t("Merge with current Sharing settings")} />
                                </FormGroup>

                            </div>
                        </Paper>

                    </div>


                );
            case 2:
                const normalise = (value) => ((value - 0) * 100) / (objectSelected.length - 1);
                return (
                    <div style={{ textAlign: "center" }}>

                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                                <LinearProgress variant="determinate" value={normalise(progress)} />
                            </Box>
                            <Box sx={{ minWidth: 35 }}>
                                <Typography variant="body2" color="success">{`${Math.round(
                                    normalise(progress)
                                )}%`}</Typography>
                            </Box>
                        </Box>

                    </div>
                )
            default:
                return 'Write to hispColombia heldersoft@gmail.com';
        }
    }

    useEffect(async () => {
        let usersAndGroups = await getUsersandGroups()
        setUsersAndgroups(usersAndGroups)
    }, [])

    useEffect(() => {
        if (Object.values(props.listObject).length > 0) {
            let tempObjectAvailable = objectAvailable;
            let nvalue = fillListObject(props.listObject);
            let foundOb = tempObjectAvailable.find(x => x.value === nvalue[0].value);

            if (assingall == true) {
                let selected = nvalue.map(n => n.value);
                handleList({ selected, objectAvailable: tempObjectAvailable.concat(nvalue) });
            }

            if (foundOb === undefined && props.originSearch === "bulklist") {
                //include object selected in list
                objectSelected.forEach((obj) => {
                    if (tempObjectAvailable.find(x => x.value === obj.value) === undefined) {
                        tempObjectAvailable.push(obj);
                    }
                })

                setObjectAvailable(tempObjectAvailable.concat(nvalue))
                setPage(page + 1)
                setLoading(false)
                setAssingall(false)
            }
            else {
                //include object selected in list
                objectSelected.forEach((obj) => {
                    if (nvalue.find(x => x.value === obj.value) === undefined) {
                        nvalue.push(obj);
                    }
                })

                setObjectAvailable(nvalue)
                setPage(page + 1)
                setLoading(false)
                setAssingall(false)
            }
        }
    }, [props.listObject])


    return (
        <div>
            <Stepper activeStep={stepIndex}>
                <Step>
                    <StepLabel>{i18n.t("Select the Object")}</StepLabel>
                </Step>
                <Step>
                    <StepLabel>{i18n.t("Define sharing and access options")}</StepLabel>
                </Step>
                <Step>
                    <StepLabel>{i18n.t("Summary")}</StepLabel>
                </Step>
            </Stepper>
            <div style={{ height: 400, margin: '0 16px' }}>
                {finished ? (
                    <div>
                        {i18n.t("Number of objects updated")} : <span style={{ "fontWeight": "bold" }}><Avatar>{messajeSuccessful.numImported}</Avatar></span>
                        <br />
                        {i18n.t("Number of objects don't updated")} : <span style={{ "fontWeight": "bold" }}> <Avatar backgroundColor={styles.errorMessaje.color}>{messajeSuccessful.numNoImported}</Avatar></span>

                        <br />
                        <div style={styles.divConcentTable}>
                            <Table> <TableBody displayRowCheckbox={false} showRowHover={false}>
                                {messajeSuccessful.obImported.map((val) => {
                                    return (<TableRow key={val.label} style={val.status == "OK" ? {} : { background: styles.errorMessaje.color }}>
                                        <TableCell>
                                            {val.label}
                                        </TableCell>
                                        <TableCell>
                                            ({val.status}) {val.message}
                                        </TableCell>
                                    </TableRow>)
                                })}
                            </TableBody></Table>
                        </div>
                        <div style={{ marginTop: 12, textAlign: 'center' }}>
                            <Button
                                primary={true}
                                onClick={exitEditMode}
                            >
                                {i18n.t("FINISH")}
                            </Button>
                        </div>


                    </div>
                ) : (
                    <div>
                        {getStepContent(stepIndex)}
                        <div style={{ marginTop: 12, textAlign: 'center', color: "Red" }}>
                            <p>{messajeError}</p>
                        </div>
                        <div style={{ marginTop: 12, textAlign: 'center' }}>
                            <Button
                                primary={true}
                                disabled={stepIndex === 3}
                                onClick={() => exitEditMode()}
                            >
                                {i18n.t("CANCEL")}
                            </Button>
                            <Button
                                disabled={stepIndex === 0 || stepIndex === 3}
                                onClick={handlePrev}
                                style={{ marginRight: 12 }}
                            >
                                {i18n.t("BACK")}
                            </Button>
                            <Button
                                primary={true}
                                disabled={stepIndex === 2}
                                onClick={stepIndex === 1 ? saveSetting : handleNext}
                                variant="contained"
                            >
                                {stepIndex === 1 ? i18n.t("SAVE SETTING") : i18n.t(" NEXT")}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default BulkMode;