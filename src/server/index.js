/* eslint-disable no-console */
import express from 'express';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import createPalette from 'material-ui/styles/palette';
import { getLoadableState } from 'loadable-components/server';
import { Provider } from 'react-redux';

import App from '../shared/app';
import store from '../shared/app/store';
import render from './render';

const createStyleManager = () => MuiThemeProvider.createDefaultContext({
    theme: createMuiTheme({
        palette: createPalette({
            type: 'light',
        }),
    }),
});


const app = express();
app.use('/assets', express.static('./dist'));

app.get('*', async (req, res) => {
    const context = {};
    const { styleManager, theme } = createStyleManager();

    const appWithRouter = (
        <MuiThemeProvider styleManager={styleManager} theme={theme}>
            <Provider store={store}>
                <StaticRouter location={req.url} context={context}>
                    <App />
                </StaticRouter>
            </Provider>
        </MuiThemeProvider>
    );

    if (context.url) {
        res.redirect(context.url);
        return;
    }

    const loadableState = await getLoadableState(appWithRouter);
    const html = ReactDOMServer.renderToString(appWithRouter);
    const css = styleManager.sheetsToString();

    res.status(200).send(render(html, css, loadableState));
});

app.listen(3000, () => console.log('Demo app listening on port 3000'));
