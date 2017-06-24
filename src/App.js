import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
    constructor(props) {
        super(props);

        this.loadFilesMeta = this.loadFilesMeta.bind(this);
        this.loadChildren = this.loadChildren.bind(this);
        this.setActiveFile = this.setActiveFile.bind(this);

        this.state = {
            activeFile: null,
            sourceRoot: [],
            root: [],
            files: {}
        };
    }

    setActiveFile(fileId) {
        this.setState((prevState) => {
            prevState.activeFile = fileId;
            return prevState;
        });
    }

    loadFilesMeta(file) {
        window.gapi.load('client', () => {
            window.gapi.client.request({
                'path': '/drive/v2/files/' + file.id,
                'method': 'GET',
                callback: (response) => {
                    this.setState((prevState) => {
                        if (!prevState.files[file.id]) {
                            prevState.files[file.id] = {};
                        }
                        prevState.files[file.id] = Object.assign(prevState.files[file.id], response);
                        return prevState;
                    });
                }
            });
        });
    }

    loadChildren(file) {
        window.gapi.load('client', () => {
            window.gapi.client.request({
                'path': '/drive/v2/files/' + file.id + '/children',
                'method': 'GET',
                callback: (response) => {
                    response.items.filter((item) => {
                        this.setState((prevState) => {
                            if (!prevState.files[item.id]) {
                                prevState.files[item.id] = {};
                            }
                            prevState.files[item.id] = Object.assign(prevState.files[item.id], item);

                            if (!prevState.files[file.id]) {
                                prevState.files[file.id] = {};
                            }
                            if (!prevState.files[file.id].children) {
                                prevState.files[file.id].children = [];
                            }
                            prevState.files[file.id].children = prevState.files[file.id].children.concat([item.id]);

                            return prevState;
                        });
                        this.loadFilesMeta(item);
                    });
                }
            });
        });
    }

    openNewFolder() {
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
            developerKey: "AIzaSyAX8H3vvauMKO3xvozJg5gOd1qT2_wGaFI"
        };

        openFilePicker((response) => {
            if (response.docs) {
                const selectedFile = response.docs[0];
                this.loadFilesMeta(selectedFile);
                this.loadChildren(selectedFile);
                this.setState((prevState) => {
                    prevState.sourceRoot = [selectedFile.id];
                    prevState.root = [selectedFile.id];
                });
            }
        }, config);

        function googleApiAuthLoad(callback, config) {
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

        function googleDrivePickerLoad(callback, config) {
            window.gapi.load('picker', {
                'callback': callback
            });
        }

        function openFilePicker(callback, config) {
            googleApiAuthLoad((authResult) => {
                var oauthToken = authResult.access_token;
                googleDrivePickerLoad(() => {
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
    }

    onResize() {
        var headerElm = document.getElementsByTagName("nav")[0];
        document.body.style.paddingTop = headerElm.offsetHeight + "px";

        /*var containers = document.getElementsByClassName("course-content-item-preview");
        for (let i = 0; i < containers.length; i++) {
            containers[i].style.minHeight = (window.innerHeight - headerElm.offsetHeight) + "px";
        }*/
    }

    componentDidMount() {
        window.onresize = this.onResize;
        window.onload = this.onResize;
    }

    render() {
        //TODO remove
        window.state = this.state;

        return (
            <div>
                <nav className="navbar navbar-toggleable-md navbar-inverse bg-inverse fixed-top">
                    <a className="navbar-brand" href="#">Vibrato</a>
                </nav>

                <div className="container">
                    {(() => {
                        if (this.state.root.length && this.state.root.length > 0) {
                            return <div className="row">
                                <ul className="col-sm-3 course-content-list">
                                    {this.state.root.map((rootId) => {
                                        if (this.state.files[rootId] && this.state.files[rootId].children) {
                                            return this.state.files[rootId].children.map((childId) => {
                                                const childFile = this.state.files[childId];
                                                return <li key={"child_" + childId} className="course-content-item">

                                                    <img src={childFile.iconLink}
                                                         className="course-content-item-icon"/>
                                                    <a href="#"
                                                       onClick={this.setActiveFile.bind(this, childFile.id)}
                                                       className="course-content-item-title">
                                                        {childFile.title}
                                                    </a>
                                                </li>
                                            });
                                        } else {
                                            return [];
                                        }
                                    })}
                                </ul>
                                <div className="col-sm-9 course-content-item-preview">
                                    {(() => {
                                        if (this.state.activeFile) {
                                            const file = this.state.files[this.state.activeFile];
                                            return <iframe className="col-sm-12" src={file.embedLink + "?autoplay=1"}></iframe>
                                        }
                                    })()}
                                </div>
                            </div>
                        } else {
                            return <div className="row">
                                <div className="col-lg-12 create-new">
                                    <p> Start creating a course by picking files from google drive</p>
                                    <button onClick={this.openNewFolder.bind(this)}
                                            className="btn btn-outline-success my-2 my-sm-0">
                                        Create New
                                    </button>
                                </div>
                            </div>
                        }
                    })()}
                </div>
            </div>
        );
    }
}

export default App;
