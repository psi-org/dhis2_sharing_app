import React, { useState, useEffect } from 'react';
import appTheme from '../theme';
import IndividualMode from './IndividualMode';
import BulkMode from './BulkMode';
import Filter from './Filter'
import { get } from '../API/Dhis2.js';
//Material UI 
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import { Dialog, DialogTitle, DialogContent, DialogActions, Alert } from '@mui/material';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';


import None from '@mui/icons-material/NotInterested';
import ActionDone from '@mui/icons-material/Done';
import ActionDoneAll from '@mui/icons-material/DoneAll';
import Help from '@mui/icons-material/Help';

//dhis2
import i18n from '../locales/index.js'

import jsonpath from 'jsonpath';

// Styles
require('../scss/app.scss');

const styles = {
    header: {
        fontSize: 24,
        fontWeight: 300,
        color: appTheme.palette.primary.textColor,
        padding: '24px 0 12px 16px',
    },
    chips: {
        color: appTheme.palette.primary.canvasColor,
        avatarColor: appTheme.palette.primary.canvasColor,
        iconColor: appTheme.palette.primary.settingOptions.icon
    }
};

const TabPanel = (props) => {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography component={'span'} variant={'body2'}>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

export const Content = (props) => {

    const [resource, setResource] = useState({})
    const [authorization, setAuthorization] = useState(true)
    const [searchByName, setSearchByName] = useState("")
    const [filterids, setFilterids] = useState("")
    const [filterString, setFilterString] = useState("")
    const [open, setOpen] = useState(false)
    const [mode, setMode] = useState("view")
    const [listObject, setListObject] = useState({})
    const [pager, setPager] = useState({ page: 0, pageCount: 0, pageSize: 0, total: 0 })
    const [originSearch, setOriginSearch] = useState(false)

    //API Query
    //query resource Selected
    const getInformationResourceSelected = async (resource) => {
        let result = {};
        try {
            let res = await get("/schemas/" + resource.key)
            return res
        }
        catch (e) {
            console.error('Could not access to API Resource')
        }
        return result
    }

    //query resource Selected
    const getResourceSelected = async (urlAPI, page = 1, searchByName = "") => {
        let result = {}
        let res = {}
        try {
            if (page == "all") {
                res = await get('/' + urlAPI + "?fields=id,code,name,displayName,externalAccess,publicAccess,userGroupAccesses[id,access,displayName~rename(name),userGroupUid],userAccesses[id,access,displayName~rename(name),userUid]&paging=false&" + (searchByName === "" ? "" : "&filter=identifiable:token:" + searchByName) + (filterids === "" ? "" : "&filter=id:in:" + filterids))
            } else {
                res = await get('/' + urlAPI + "?fields=id,code,name,displayName,externalAccess,publicAccess,userGroupAccesses[id,access,displayName~rename(name),userGroupUid],userAccesses[id,access,displayName~rename(name),userUid]&page=" + page + (searchByName === "" ? "" : "&filter=identifiable:token:" + searchByName) + (filterids === "" ? "" : "&filter=id:in:" + filterids))
            }
            if (res.hasOwnProperty(urlAPI)) {
                return res
            }
        }
        catch (e) {
            console.error('Could not access to API Resource', e)
        }
        return result;
    }

    //validate if user has the authority required to access sharing setting
    const checkAuthority = (resource) => {
        // if listsections.json is empty, get it from dhis2
        get('/schemas/' + resource).then(r => {
            let authorities = r.authorities.find(a => a.type === 'CREATE_PUBLIC').authorities
            get('/me').then(me => {
                let foundSuperUser = me.authorities.indexOf("ALL")
                if (foundSuperUser === -1) {
                    let _authorities = authorities.filter(au => me.authorities.includes(au))
                    if (_authorities.length === authorities.length) {
                        setAuthorization(true)
                    } else {
                        setAuthorization(false)
                    }
                } else {
                    setAuthorization(true)
                }
            })
        }).catch(error => {
            console.log(error)
        })
    }

    //tabs handle
    const handleChangeTabs = (textSearch, value, page = 1) => {
        if (typeof (textSearch) !== "string") {
            textSearch = ""
        }

        //refresh List
        getResourceSelected(props.informationResource.resource, page, textSearch).then(res => {
            let dataResult = {}
            for (let g of res[props.informationResource.resource]) {
                dataResult[g.id] = g
            }
            setListObject(dataResult)
            setPager(res.pager)

        });

        // update state
        setMode(value)
        props.disableSlide(value)
    };

    //tabs handle
    const reloadData = (page = 1) => {
        //refresh List
        getResourceSelected(props.informationResource.resource, page).then(res => {
            let dataResult = {}

            for (let g of res[props.informationResource.resource]) {
                dataResult[g.id] = g
            }

            setListObject(dataResult)
            setOriginSearch("bulklist")
        });
    };

    //handle filter
    //handler
    const handlefilterTextChange = (textSearch) => {
        setSearchByName(textSearch)
        setOriginSearch("search")
        handleChangeTabs(textSearch, mode)
    }

    const getFilterSelected = (filterValue, filter) => {
        if (Object.keys(filterValue).length != 0) {
            let arrid = jsonpath.query(filterValue, filter.expression)
            setOriginSearch("search")
            setFilterString(JSON.stringify(filterValue))
            setFilterids(JSON.stringify(arrid).replace(/['"]+/g, ''))
            handleChangeTabs(undefined, mode)
        } else {
            setFilterString("")
        }
    }

    //handle Modal
    const handleOpen = () => {
        setOpen(true)
    };

    const handleClose = () => {
        setOpen(false)
    };

    // life cycle
    useEffect(() => {
        try {
            if (props.informationResource.resource != undefined) {
                //validate authorization
                checkAuthority(props.informationResource.key)

                //reset count of pages
                setOriginSearch(true)

                getResourceSelected(props.informationResource.resource).then(res => {
                    let dataResult = {}
                    for (let g of res[props.informationResource.resource]) {
                        dataResult[g.id] = g;
                    }
                    setListObject(dataResult)
                    setPager(res.pager)
                })

                ///get information resource
                getInformationResourceSelected(props.informationResource).then(res => {
                    setResource(res)
                })
            }
        } catch (err) {
            console.log(err)
        }
    }, [props.informationResource])

    return (
        <div className="app">
            <div className='content-area'>
                <div style={styles.header}>
                    Sharing Setting for:  <span style={{ "fontWeight": "bold" }}>{i18n.t(props.title)}</span>
                </div>
                {!authorization && <div><Alert severity="error">{i18n.t("You do not have all the authorizations required to " + props.title)}</Alert></div>}
                <div style={{ textAlign: 'right' }}>
                    <IconButton onClick={handleOpen}><Help /> </IconButton>
                    <Dialog
                        open={open}
                        onClose={handleClose}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">
                            {i18n.t("Conventions")}
                        </DialogTitle>
                        <DialogContent>
                            <div>
                                <div>{i18n.t("METADATA - privileges related to access")}</div>
                                <Chip backgroundColor={styles.chips.color}
                                    avatar={<Avatar backgroundColor={styles.chips.avatarColor} color={styles.chips.iconColor}><None /></Avatar>}
                                    label={i18n.t("No Access")}
                                />
                                <Chip backgroundColor={styles.chips.color}
                                    avatar={<Avatar backgroundColor={styles.chips.avatarColor} color={styles.chips.iconColor}><ActionDone /></Avatar>}
                                    label={i18n.t("Can find and view")}
                                />
                                <Chip backgroundColor={styles.chips.color}
                                    avatar={<Avatar backgroundColor={styles.chips.avatarColor} color={styles.chips.iconColor}><ActionDoneAll /></Avatar>}
                                    label={i18n.t("Can find, view and edit")}
                                />

                            </div>
                            <div>
                                <div>{i18n.t("DATA - Privileges related to data registration and access")}</div>
                                <Chip backgroundColor={styles.chips.color}
                                    avatar={<Avatar backgroundColor={styles.chips.avatarColor} color={styles.chips.iconColor}><None /></Avatar>}
                                    label={i18n.t("No Access")}
                                />
                                <Chip backgroundColor={styles.chips.color}
                                    avatar={<Avatar backgroundColor={styles.chips.avatarColor} color={styles.chips.iconColor}><ActionDone /></Avatar>}
                                    label={i18n.t("Can register")}
                                />
                                <Chip backgroundColor={styles.chips.color}
                                    avatar={<Avatar backgroundColor={styles.chips.avatarColor} color={styles.chips.iconColor}><ActionDoneAll /></Avatar>}
                                    label={i18n.t("Can find, view and edit")}
                                />

                            </div>

                        </DialogContent>
                        <DialogActions>

                            <Button onClick={handleClose} autoFocus>
                                {i18n.t("Close")}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
                {authorization && <><Filter
                    handlefilterTextChange={handlefilterTextChange}
                    handleReturnFilterSelected={getFilterSelected}
                    filterAvailable={props.informationResource}
                />
                    <Tabs
                        value={mode}
                        onChange={handleChangeTabs}
                    >
                        <Tab label={i18n.t("Individual mode")} value="view" />
                        <Tab label={i18n.t("Bulk mode")} value="edit" />
                    </Tabs>
                    <Box>
                        <TabPanel value={mode} index={"view"}>
                            <IndividualMode
                                resource={props.informationResource}
                                Enabledchecked={false}
                                listObject={listObject}
                                pager={pager}
                                originSearch={originSearch}
                                handleChangeTabs={handleChangeTabs}
                                searchByName={searchByName}
                                filterString={filterString}
                                informationResource={resource}

                            />
                        </TabPanel>
                        <TabPanel value={mode} index={"edit"}>
                            <BulkMode
                                resource={props.informationResource}
                                listObject={listObject}
                                pager={pager}
                                originSearch={originSearch}
                                searchByName={searchByName}
                                filterString={filterString}
                                handleChangeTabs={handleChangeTabs}
                                reloadData={reloadData}
                                informationResource={resource}
                            />
                        </TabPanel>

                    </Box></>}
            </div>
        </div>
    )
}

export default Content