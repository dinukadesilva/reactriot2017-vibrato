import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {

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
            const selectedFile = response.docs[0];
            window.gapi.load('client', function() {
                window.gapi.client.request({
                    'path': '/drive/v2/files/' + selectedFile.id + '/children',
                    'method': 'GET',
                    callback: function (response) {
                        window.gapi.client.request({
                            'path': '/drive/v2/files/' + selectedFile.id,
                            'method': 'GET',
                            callback: function (responsejs) {
                            }
                        });
                    }
                });
            })
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
                        .setMimeTypes('application/vnd.google-apps.folder')
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

    render() {
        return (
            <div>
                <nav className="navbar navbar-toggleable-md navbar-inverse bg-inverse fixed-top">
                    <button className="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse"
                            data-target="#navbarsExampleDefault" aria-controls="navbarsExampleDefault"
                            aria-expanded="false"
                            aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <a className="navbar-brand" href="#">Vibrato</a>

                    <div className="collapse navbar-collapse" id="navbarsExampleDefault">
                        <ul className="navbar-nav mr-auto">
                            <li className="nav-item active">
                                <a className="nav-link" href="#">Home <span className="sr-only">(current)</span></a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#">Link</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link disabled" href="#">Disabled</a>
                            </li>
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="http://example.com" id="dropdown01"
                                   data-toggle="dropdown"
                                   aria-haspopup="true" aria-expanded="false">Dropdown</a>
                                <div className="dropdown-menu" aria-labelledby="dropdown01">
                                    <a className="dropdown-item" href="#">Action</a>
                                    <a className="dropdown-item" href="#">Another action</a>
                                    <a className="dropdown-item" href="#">Something else here</a>
                                </div>
                            </li>
                        </ul>
                        <form className="form-inline my-2 my-lg-0">
                            <input className="form-control mr-sm-2" type="text" placeholder="Search"/>
                            <button className="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
                        </form>
                    </div>
                </nav>

                <div className="container">

                    <div className="starter-template">
                        <h1>Bootstrap starter template</h1>
                        <p className="lead">Use this document as a way to quickly start any new project.<br /> All you
                            get is
                            this text and a
                            mostly barebones HTML document.</p>
                        <button onClick={this.openNewFolder.bind(this)}>Click</button>
                    </div>

                </div>
            </div>
        );
    }
}

export default App;
