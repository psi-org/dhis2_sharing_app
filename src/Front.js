import React, { useEffect, useState } from 'react'

//DHIS2 component
import i18n from './locales/index.js'

//Components
import InitialListSection from './data/listSections.json'
import Content from './components/Content'

import SideMenu from './components/SideMenu';

import { get, post } from './API/Dhis2'

let currentSection;
let sidebarRef;

const stylesLocal = {
    hidden: {
        background: 'gray',
        width: 290,
        height: '100%',
        position: 'absolute',
        opacity: '0.3',
        zIndex: 100
    }
}

export const AppFront = () => {

    const [snackbarMessage, setSnackbarMessage] = useState('')
    const [showSnackbar, setShowSnackbar] = useState(false)
    const [formValidator, setFormValidator] = useState(undefined)
    const [sectionToRender, setSectionToRender] = useState('')
    const [informationResource, setInformationResource] = useState({})
    const [textSearch, setTextSearch] = useState("")
    const [hiddenSlide, setHiddenSlide] = useState(true)
    const [ListSection, setListSection] = useState({ sections: [] })

    const changeSectionHandler = (key, searchText) => {
        currentSection = key;
        if (key !== 'search' && sidebarRef) {
            sidebarRef.clearSearchBox();
        }

        setResourceSelected(currentSection);
    }

    const setResourceSelected = (keySelected) => {
        let resourceSelected = ListSection.sections.find(function (resource) {
            return resource.label === keySelected;
        });

        setInformationResource(resourceSelected)
        setSectionToRender(currentSection)
        setTextSearch("")

    }

    const changeSearchTextHandler = (searchText) => {
        setTextSearch(searchText)
    }

    const disableSlide = (mode) => {
        if (mode == 'edit') {
            setHiddenSlide(false)
        }
        else {
            setHiddenSlide(true)
        }
    }

    useEffect(() => {

        // if listsections.json is empty, get it from dhis2
        get('/dataStore/sharingsettingapp/listSections').then(r => {
            if (r.httpStatusCode === 404) {
                setListSection(InitialListSection)
                setSectionToRender(InitialListSection.sections[0].label)
                setInformationResource(InitialListSection.sections[0])
                post('/dataStore/sharingsettingapp/listSections', InitialListSection)
                    .then(r => { console.log(r) })
            }
            else {
                setListSection(r)
                setSectionToRender(r.sections[0].label)
                setInformationResource(r.sections[0])
            }
        }).catch(error => {
            console.log(error);
        })

    }, [])

    return (
        <>
            {
                hiddenSlide
                    ? ""
                    : <div style={stylesLocal.hidden} ></div>

            }
            <div className="app-wrapper">
                <SideMenu sections={
                    ListSection.sections.map((section) => {
                        let label = i18n.t(section.label)
                        let key = section.label
                        return ({ key, label })

                    }).filter(section => section.label.includes(textSearch) == true || textSearch == "")
                }
                    currentSection={sectionToRender}
                    onChangeSection={changeSectionHandler}
                    onChangeSearchText={changeSearchTextHandler}
                />


                <Content
                    title={sectionToRender}
                    informationResource={informationResource}
                    disableSlide={disableSlide}
                />

            </div>
        </>
    )
}

export default AppFront;

