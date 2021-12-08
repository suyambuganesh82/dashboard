import { BehaviorSubject } from 'rxjs';
import { ApplicationObject } from "./appDetails.type";
import { URLS } from "../../../config";
import { toast } from 'react-toastify';

let applicationObjectTabs: Array<ApplicationObject> = [];
let applicationObjectTabsSubject: BehaviorSubject<Array<ApplicationObject>> = new BehaviorSubject(applicationObjectTabs);
let currentTab: string = "";

const addAOT = (tabName: string, tabUrl: string, isSelected: boolean, title?: string) => {
    let tab = {} as ApplicationObject
    tab.name = tabName.toLowerCase()
    tab.url = tabUrl
    tab.isSelected = isSelected
    tab.title = title || tabName
    applicationObjectTabs.push(tab)
}

const AppDetailsStore = {

    getAppDetailsTabs: () => {
        return applicationObjectTabsSubject.getValue()
    },
    getAppDetailsTabsObservable: () => {
        return applicationObjectTabsSubject.asObservable()
    },
    initAppDetailsTabs: (_url: string) => {
        applicationObjectTabs = []

        addAOT(URLS.APP_DETAILS_K8, _url + "/" + URLS.APP_DETAILS_K8, true)
        addAOT(URLS.APP_DETAILS_LOG, _url + "/" + URLS.APP_DETAILS_LOG, false)

        applicationObjectTabsSubject.next([...applicationObjectTabs])
    },
    addAppDetailsTab: (tabKind: string, tabName: string, tabURL: string) => {

        if (!tabName || !tabURL || !tabKind) return


        if(applicationObjectTabs.length ===7) {
            toast.error('Max 5 tabs allowed')
            return
        }

        let alredyAdded = false
        let title = tabKind + '/' + tabName
        tabName = tabKind + '/...' + tabName.slice(-6)

        for (let index = 0; index < applicationObjectTabs.length; index++) {
            const tab = applicationObjectTabs[index];
            tab.isSelected = false
            if (tab.name.toLowerCase() === tabName.toLowerCase()) {
                tab.isSelected = true
                alredyAdded = true
            }
        }

        if (!alredyAdded) {
            addAOT(tabName, tabURL, true, title)
        }

        applicationObjectTabsSubject.next([...applicationObjectTabs])
    },
    removeAppDetailsTab: (tabName: string) => {
        let _applicationObjectTabs = []

        for (let index = 0; index < applicationObjectTabs.length; index++) {
            const tab = applicationObjectTabs[index];
            tab.isSelected = index === 0
            if (tab.name.toLowerCase() !== tabName.toLowerCase()) {
                _applicationObjectTabs.push(tab)
            }
        }

        applicationObjectTabs = _applicationObjectTabs

        applicationObjectTabsSubject.next([...applicationObjectTabs])
    },
    markAppDetailsTabActive: (tabName: string) => {
        for (let index = 0; index < applicationObjectTabs.length; index++) {
            const tab = applicationObjectTabs[index];
            tab.isSelected = false
            if (tab.name.toLowerCase() === tabName.toLowerCase()) {
                tab.isSelected = true
            }
        }

        applicationObjectTabsSubject.next([...applicationObjectTabs])
    },
    setCurrentTab: (_str: string) => {
        currentTab = _str
        AppDetailsStore.markAppDetailsTabActive(_str)
    },
    getCurrentTab: () => {
        return currentTab
    }
}

export default AppDetailsStore;