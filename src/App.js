import React, {Component} from 'react';
import Sample from './Capture.PNG';
import './App.css';
import "box-layout"

var config = {
    clientId: "727711806389-rgpnchek1ttqr2km79a6vreqakfv58o8.apps.googleusercontent.com",
    scope: [
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/drive.readonly",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/drive.install"
    ],
    appId: "727711806389",
    developerKey: "AIzaSyAX8H3vvauMKO3xvozJg5gOd1qT2_wGaFI",
    apiKey: "AIzaSyAX8H3vvauMKO3xvozJg5gOd1qT2_wGaFI"
};

class App extends Component {
    constructor(props) {
        super(props);

        this.loadFilesMeta = this.loadFilesMeta.bind(this);
        this.loadChildren = this.loadChildren.bind(this);
        this.setActiveFile = this.setActiveFile.bind(this);




        this.state = {
            activeFile: null,
            sourceRoot: this.getSourceRootFromUrl(),
            root: this.getSourceRootFromUrl(),
            files: {}
        };

        if (this.getSourceRootFromUrl().length > 0) {
            this.googleApiAuthLoad(() => {
                this.getSourceRootFromUrl().filter((fileId) => {
                    this.loadFilesMeta(fileId);
                    this.loadChildren(fileId);
                });
            }, config);
        }
    }

    getSourceRootFromUrl() {
        var params = new URLSearchParams(window.location.search.slice(1));
        let sourceParam = params.get("i");
        if (!sourceParam) {
            return [];
        } else {
            sourceParam = window.decodeURIComponent(sourceParam);
            return sourceParam.split(",");
        }
    }

    setActiveFile(fileId) {
        this.setState((prevState) => {
            prevState.activeFile = fileId;
            return prevState;
        });
    }

    loadFilesMeta(fileId) {
        window.gapi.load('client', () => {
            window.gapi.client.request({
                'path': '/drive/v2/files/' + fileId,
                'method': 'GET',
                callback: (response) => {
                    this.setState((prevState) => {
                        if (!prevState.files[fileId]) {
                            prevState.files[fileId] = {};
                        }
                        prevState.files[fileId] = Object.assign(prevState.files[fileId], response);
                        return prevState;
                    });
                }
            });
        });
    }

    loadChildren(fileId) {
        window.gapi.load('client', () => {
            window.gapi.client.request({
                'path': '/drive/v2/files/' + fileId + '/children',
                'method': 'GET',
                callback: (response) => {
                    response.items.filter((item) => {
                        this.setState((prevState) => {
                            if (!prevState.files[item.id]) {
                                prevState.files[item.id] = {};
                            }
                            prevState.files[item.id] = Object.assign(prevState.files[item.id], item);

                            if (!prevState.files[fileId]) {
                                prevState.files[fileId] = {};
                            }
                            if (!prevState.files[fileId].children) {
                                prevState.files[fileId].children = [];
                            }
                            prevState.files[fileId].children = prevState.files[fileId].children.concat([item.id]);

                            return prevState;
                        });
                        this.loadFilesMeta(item.id);
                    });
                }
            });
        });
    }

    googleApiAuthLoad(callback, config) {
        window.gapi.load('auth', {
            'callback': function () {
                window.gapi.auth.authorize({
                    'client_id': config.clientId,
                    'scope': config.scope,
                    'immediate': false
                }, callback);
            }
        });
    };

    googleDrivePickerLoad(callback, config) {
        window.gapi.load('picker', {
            'callback': callback
        });
    }

    openNewFolder() {
        this.openFilePicker((response) => {
            if (response.docs) {
                const selectedFile = response.docs[0];
                window.location = window.location.origin + window.location.pathname + "?i=" + window.encodeURIComponent([selectedFile.id]);
                /*this.setState((prevState) => {
                    prevState.sourceRoot = [selectedFile.id];
                    prevState.root = [selectedFile.id];
                });*/
            }
        }, config);
    }

    openFilePicker(callback, config) {
        this.googleApiAuthLoad((authResult) => {
            var oauthToken = authResult.access_token;
            this.googleDrivePickerLoad(() => {
                var docsView = new window.google.picker.DocsView()
                    .setIncludeFolders(true)
                    //.setMimeTypes('application/vnd.google-apps.folder')
                    .setSelectFolderEnabled(true);


                var picker = new window.google.picker.PickerBuilder()
                    .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
                    .addView(docsView)
                    .setCallback(callback)
                    .setAppId(config.appId)
                    .setOAuthToken(oauthToken)
                    .setDeveloperKey(config.developerKey)
                    .build();

                picker.setVisible(true);
            });
        }, config);
    }

    onResize() {
        var headerElm = document.getElementsByClassName("header")[0];
        document.body.style.paddingTop = headerElm.offsetHeight + "px";

        /*var containers = document.getElementsByClassName("course-content-item-preview");
         for (let i = 0; i < containers.length; i++) {
         containers[i].style.minHeight = (window.innerHeight - headerElm.offsetHeight) + "px";
         }*/
    }

    componentDidMount() {
        window.onresize = this.onResize;
        window.onload = this.onResize;
        window.HACKBIT_VOTING_WIDGET.render(document.getElementById("voting-banner"));
    }

    render() {
        //TODO remove
        window.state = this.state;

        return (
            <div className="box wrap-parent wrap-parent-height no-padding">
                <div className="box wrap-parent header">
                    <div className="box wrap-parent no-padding" id="voting-banner"></div>
                    <div className="box wrap-parent no-padding header-content">
                        <a href="#" className="box header-title">Vibrato</a>
                    </div>
                </div>
                {(() => {
                    if (this.state.root.length && this.state.root.length > 0) {
                        return <div className="box wrap-parent wrap-parent-height no-padding">
                            <div className="box wrap-parent-height no-padding side-nav">
                                <ul className="box wrap-parent wrap-parent-height course-content-list">
                                    {this.state.root.map((rootId) => {
                                        if (this.state.files[rootId] && this.state.files[rootId].children) {
                                            return this.state.files[rootId].children.map((childId) => {
                                                const childFile = this.state.files[childId];
                                                const statusClassName = this.state.activeFile == childId ? " active" : "";
                                                return <li key={"child_" + childId}
                                                           className={"box wrap-parent course-content-item" + statusClassName}>

                                                    <img src={childFile.iconLink}
                                                         className="box course-content-item-icon"/>
                                                    <a href="#"
                                                       onClick={this.setActiveFile.bind(this, childFile.id)}
                                                       className="box course-content-item-title">
                                                        {childFile.title}
                                                    </a>
                                                </li>
                                            });
                                        } else {
                                            return [];
                                        }
                                    })}
                                </ul>
                            </div>
                            <div className="box wrap-parent-height course-content-item-preview no-padding">
                                {(() => {
                                    if (this.state.activeFile) {
                                        const file = this.state.files[this.state.activeFile];
                                        return <iframe className="box wrap-parent wrap-parent-height no-padding"
                                                       src={file.embedLink + "?autoplay=1"}>
                                        </iframe>
                                    }
                                })()}
                            </div>
                        </div>
                    } else {
                        return <div className="box wrap-parent">
                            <div className="box wrap-parent create-new">
                                <p> Start creating a course by picking files from google drive</p>
                                <button onClick={this.openNewFolder.bind(this)}
                                        className="btn">
                                    Create New
                                </button>
                                <div className="box wrap-parent"></div>
                                <img className="box wrap-parent demo-img" src={Sample}/>
                            </div>
                        </div>
                    }
                })()}
            </div>
        );
    }
}

export default App;
