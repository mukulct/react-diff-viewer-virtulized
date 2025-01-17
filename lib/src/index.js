var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import cn from 'classnames';
import * as React from 'react';
import { BlobWorker, Thread, spawn } from 'threads';
import { DiffMethod, DiffType, } from './compute-lines';
import computeStyles from './styles';
import { VariableSizeList as List } from 'react-window';
import { worker } from './worker-output';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
const m = require('memoize-one');
const memoize = m.default || m;
export var LineNumberPrefix;
(function (LineNumberPrefix) {
    LineNumberPrefix["LEFT"] = "L";
    LineNumberPrefix["RIGHT"] = "R";
})(LineNumberPrefix || (LineNumberPrefix = {}));
class DiffViewer extends React.Component {
    constructor(props) {
        super(props);
        /**
         * Resets code block expand to the initial stage. Will be exposed to the parent component via
         * refs.
         */
        this.resetCodeBlocks = () => {
            if (this.state.expandedBlocks.length > 0) {
                this.setState((prev) => (Object.assign(Object.assign({}, prev), { expandedBlocks: [] })));
                return true;
            }
            return false;
        };
        /**
         * Pushes the target expanded code block to the state. During the re-render,
         * this value is used to expand/fold unmodified code.
         */
        this.onBlockExpand = (id) => {
            const prevState = this.state.expandedBlocks.slice();
            prevState.push(id);
            this.setState((prev) => (Object.assign(Object.assign({}, prev), { expandedBlocks: prevState })));
        };
        /**
         * Computes final styles for the diff viewer. It combines the default styles with the user
         * supplied overrides. The computed styles are cached with performance in mind.
         *
         * @param styles User supplied style overrides.
         */
        this.computeStyles = memoize(computeStyles);
        /**
         * Returns a function with clicked line number in the closure. Returns an no-op function when no
         * onLineNumberClick handler is supplied.
         *
         * @param id Line id of a line.
         */
        this.onLineNumberClickProxy = (id) => {
            if (this.props.onLineNumberClick) {
                return (e) => this.props.onLineNumberClick(id, e);
            }
            return () => {
                // nothing
            };
        };
        /**
         * Maps over the word diff and constructs the required React elements to show word diff.
         *
         * @param diffArray Word diff information derived from line information.
         * @param renderer Optional renderer to format diff words. Useful for syntax highlighting.
         */
        this.renderWordDiff = (diffArray, renderer) => {
            return diffArray.map((wordDiff, i) => {
                return (_jsx("span", { className: cn(this.styles.wordDiff, {
                        [this.styles.wordAdded]: wordDiff.type === DiffType.ADDED,
                        [this.styles.wordRemoved]: wordDiff.type === DiffType.REMOVED,
                    }), children: renderer ? renderer(wordDiff.value) : wordDiff.value }, i));
            });
        };
        /**
         * Maps over the line diff and constructs the required react elements to show line diff. It calls
         * renderWordDiff when encountering word diff. This takes care of both inline and split view line
         * renders.
         *
         * @param lineNumber Line number of the current line.
         * @param type Type of diff of the current line.
         * @param prefix Unique id to prefix with the line numbers.
         * @param value Content of the line. It can be a string or a word diff array.
         * @param additionalLineNumber Additional line number to be shown. Useful for rendering inline
         *  diff view. Right line number will be passed as additionalLineNumber.
         * @param additionalPrefix Similar to prefix but for additional line number.
         */
        this.renderLine = (lineNumber, type, prefix, value, additionalLineNumber, additionalPrefix) => {
            const lineNumberTemplate = `${prefix}-${lineNumber}`;
            const additionalLineNumberTemplate = `${additionalPrefix}-${additionalLineNumber}`;
            const highlightLine = this.props.highlightLines.includes(lineNumberTemplate) ||
                this.props.highlightLines.includes(additionalLineNumberTemplate);
            const added = type === DiffType.ADDED;
            const removed = type === DiffType.REMOVED;
            const changed = type === DiffType.CHANGED;
            let content;
            if (Array.isArray(value)) {
                content = this.renderWordDiff(value, this.props.renderContent);
            }
            else if (this.props.renderContent) {
                content = this.props.renderContent(value);
            }
            else {
                content = value;
            }
            return (_jsxs(React.Fragment, { children: [!this.props.hideLineNumbers && (_jsx("td", { onClick: lineNumber && this.onLineNumberClickProxy(lineNumberTemplate), className: cn(this.styles.gutter, {
                            [this.styles.emptyGutter]: !lineNumber,
                            [this.styles.diffAdded]: added,
                            [this.styles.diffRemoved]: removed,
                            [this.styles.diffChanged]: changed,
                            [this.styles.highlightedGutter]: highlightLine,
                        }), children: _jsx("pre", { className: this.styles.lineNumber, children: lineNumber }) })), !this.props.splitView && !this.props.hideLineNumbers && (_jsx("td", { onClick: additionalLineNumber &&
                            this.onLineNumberClickProxy(additionalLineNumberTemplate), className: cn(this.styles.gutter, {
                            [this.styles.emptyGutter]: !additionalLineNumber,
                            [this.styles.diffAdded]: added,
                            [this.styles.diffRemoved]: removed,
                            [this.styles.diffChanged]: changed,
                            [this.styles.highlightedGutter]: highlightLine,
                        }), children: _jsx("pre", { className: this.styles.lineNumber, children: additionalLineNumber }) })), this.props.renderGutter
                        ? this.props.renderGutter({
                            lineNumber,
                            type,
                            prefix,
                            value,
                            additionalLineNumber,
                            additionalPrefix,
                            styles: this.styles,
                        })
                        : null, _jsx("td", { className: cn(this.styles.marker, {
                            [this.styles.emptyLine]: !content,
                            [this.styles.diffAdded]: added,
                            [this.styles.diffRemoved]: removed,
                            [this.styles.diffChanged]: changed,
                            [this.styles.highlightedLine]: highlightLine,
                        }), children: _jsxs("pre", { children: [added && '+', removed && '-'] }) }), _jsx("td", { className: cn(this.styles.content, {
                            [this.styles.emptyLine]: !content,
                            [this.styles.diffAdded]: added,
                            [this.styles.diffRemoved]: removed,
                            [this.styles.diffChanged]: changed,
                            [this.styles.highlightedLine]: highlightLine,
                        }), children: _jsx("pre", { className: this.styles.contentText, children: content }) })] }));
        };
        /**
         * Generates lines for split view.
         *
         * @param obj Line diff information.
         * @param obj.left Life diff information for the left pane of the split view.
         * @param obj.right Life diff information for the right pane of the split view.
         * @param index React key for the lines.
         */
        this.renderSplitView = ({ left, right }, index, styles) => {
            return (_jsxs(_Fragment, { children: [this.renderLine(left.lineNumber, left.type, LineNumberPrefix.LEFT, left.value), this.renderLine(right.lineNumber, right.type, LineNumberPrefix.RIGHT, right.value)] }));
        };
        /**
         * Generates lines for inline view.
         *
         * @param obj Line diff information.
         * @param obj.left Life diff information for the added section of the inline view.
         * @param obj.right Life diff information for the removed section of the inline view.
         * @param index React key for the lines.
         */
        this.renderInlineView = ({ left, right }, index, styles) => {
            let content;
            if (left.type === DiffType.REMOVED && right.type === DiffType.ADDED) {
                return (_jsxs(React.Fragment, { children: [_jsx("tr", { className: this.styles.line, children: this.renderLine(left.lineNumber, left.type, LineNumberPrefix.LEFT, left.value, null) }), _jsx("tr", { className: this.styles.line, children: this.renderLine(null, right.type, LineNumberPrefix.RIGHT, right.value, right.lineNumber) })] }, index));
            }
            if (left.type === DiffType.REMOVED) {
                content = this.renderLine(left.lineNumber, left.type, LineNumberPrefix.LEFT, left.value, null);
            }
            if (left.type === DiffType.DEFAULT) {
                content = this.renderLine(left.lineNumber, left.type, LineNumberPrefix.LEFT, left.value, right.lineNumber, LineNumberPrefix.RIGHT);
            }
            if (right.type === DiffType.ADDED) {
                content = this.renderLine(null, right.type, LineNumberPrefix.RIGHT, right.value, right.lineNumber);
            }
            return (_jsx("tr", { className: this.styles.line, children: content }, index));
        };
        /**
         * Returns a function with clicked block number in the closure.
         *
         * @param id Cold fold block id.
         */
        this.onBlockClickProxy = (id) => () => this.onBlockExpand(id);
        /**
         * Generates cold fold block. It also uses the custom message renderer when available to show
         * cold fold messages.
         *
         * @param num Number of skipped lines between two blocks.
         * @param blockNumber Code fold block id.
         * @param leftBlockLineNumber First left line number after the current code fold block.
         * @param rightBlockLineNumber First right line number after the current code fold block.
         */
        this.renderSkippedLineIndicator = (num, blockNumber, leftBlockLineNumber, rightBlockLineNumber) => {
            const { hideLineNumbers, splitView } = this.props;
            const message = this.props.codeFoldMessageRenderer ? (this.props.codeFoldMessageRenderer(num, leftBlockLineNumber, rightBlockLineNumber)) : (_jsxs("pre", { className: this.styles.codeFoldContent, children: ["Expand ", num, " lines ..."] }));
            const content = (_jsx("td", { children: _jsx("a", { onClick: this.onBlockClickProxy(blockNumber), tabIndex: 0, children: message }) }));
            const isUnifiedViewWithoutLineNumbers = !splitView && !hideLineNumbers;
            return (_jsxs(_Fragment, { children: [!hideLineNumbers && _jsx("td", { className: this.styles.codeFoldGutter }), this.props.renderGutter ? (_jsx("td", { className: this.styles.codeFoldGutter })) : null, _jsx("td", { className: cn({
                            [this.styles.codeFoldGutter]: isUnifiedViewWithoutLineNumbers,
                        }) }), isUnifiedViewWithoutLineNumbers ? (_jsxs(React.Fragment, { children: [_jsx("td", {}), content] })) : (_jsxs(React.Fragment, { children: [content, this.props.renderGutter ? _jsx("td", {}) : null, _jsx("td", {})] })), _jsx("td", {}), _jsx("td", {})] }));
        };
        /**
         * Generates the entire diff view.
         */
        this.renderDiff = () => {
            const { splitView } = this.props;
            const rowRenderer = (index, styles) => {
                const line = this.state.lineInformation[index];
                const lineIndex = index;
                if (this.props.showDiffOnly) {
                    const blockIndex = this.state.lineBlocks[lineIndex];
                    if (blockIndex !== undefined) {
                        const lastLineOfBlock = this.state.blocks[blockIndex].endLine === lineIndex;
                        if (!this.state.expandedBlocks.includes(blockIndex) &&
                            lastLineOfBlock) {
                            return {
                                component: (_jsx(_Fragment, { children: this.renderSkippedLineIndicator(this.state.blocks[blockIndex].lines, blockIndex, line.left.lineNumber, line.right.lineNumber) })),
                                props: {
                                    className: this.styles.codeFold,
                                },
                            };
                        }
                        else if (!this.state.expandedBlocks.includes(blockIndex)) {
                            return null;
                        }
                    }
                }
                const diffNodes = splitView
                    ? this.renderSplitView(line, lineIndex, styles)
                    : this.renderInlineView(line, lineIndex, styles);
                return {
                    component: diffNodes,
                    props: {
                        className: this.styles.line,
                    },
                };
            };
            return rowRenderer;
        };
        this.render = () => {
            var _a;
            const { oldValue, newValue, useDarkTheme, leftTitle, rightTitle, splitView, hideLineNumbers, nonce, } = this.props;
            if (this.props.compareMethod !== DiffMethod.JSON) {
                if (typeof oldValue !== 'string' || typeof newValue !== 'string') {
                    throw Error('"oldValue" and "newValue" should be strings');
                }
            }
            this.styles = this.computeStyles(this.props.styles, useDarkTheme, nonce);
            const diffRenderer = this.renderDiff();
            const nodes = this.state.lineInformation
                .map((_, index) => {
                return diffRenderer(index, {});
            })
                .filter((node) => node !== null);
            const colSpanOnSplitView = hideLineNumbers ? 2 : 3;
            const colSpanOnInlineView = hideLineNumbers ? 2 : 4;
            const columnExtension = this.props.renderGutter ? 1 : 0;
            const title = (leftTitle || rightTitle) && (_jsxs("tr", { style: { height: '45px' }, children: [_jsx("td", { colSpan: (splitView ? colSpanOnSplitView : colSpanOnInlineView) +
                            columnExtension, className: this.styles.titleBlock, children: _jsx("pre", { className: this.styles.contentText, children: leftTitle }) }), splitView && (_jsx("td", { colSpan: colSpanOnSplitView + columnExtension, className: this.styles.titleBlock, children: _jsx("pre", { className: this.styles.contentText, children: rightTitle }) }))] }));
            return (_jsx(DynamicSizeList, { nodes: nodes, title: Boolean((_a = this.state.lineInformation) === null || _a === void 0 ? void 0 : _a.length) && title, splitView: splitView, styles: this.styles }));
        };
        this.state = {
            expandedBlocks: [],
            lineInformation: [],
            diffLines: [],
            blocks: [],
            lineBlocks: [],
            ready: false,
        };
    }
    componentDidMount() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            (_b = (_a = this.props).onComputing) === null || _b === void 0 ? void 0 : _b.call(_a, true);
            try {
                const workerCode = window.atob(worker);
                this.worker = yield spawn(BlobWorker.fromText(workerCode));
                this.setState(Object.assign(Object.assign({}, this.state), { ready: true }));
                this._componentDidUpdate(this.props, true);
            }
            catch (e) {
                console.error('Error setting up diff worker', e);
            }
        });
    }
    componentWillUnmount() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.worker) {
                try {
                    yield Thread.terminate(this.worker);
                }
                catch (e) {
                    console.error('error terminating diff worker', e);
                }
            }
        });
    }
    componentDidUpdate(prevProps) {
        var _a, _b;
        if (!this.state.ready) {
            (_b = (_a = this.props).onComputing) === null || _b === void 0 ? void 0 : _b.call(_a, true);
            return;
        }
        this._componentDidUpdate(prevProps);
    }
    _componentDidUpdate(prevProps, computeNow) {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function* () {
            let lineInfoChanged = false;
            const { oldValue, newValue, disableWordDiff, compareMethod, linesOffset } = this.props;
            let updateLineInformation = this.state.lineInformation;
            let updateDiffLines = this.state.diffLines;
            if (oldValue !== prevProps.oldValue ||
                newValue !== prevProps.newValue ||
                computeNow) {
                (_b = (_a = this.props).onComputing) === null || _b === void 0 ? void 0 : _b.call(_a, true);
                const startTime = Date.now();
                console.log('Computing diff', oldValue.toString().length, newValue.toString().length);
                const { lineInformation, diffLines } = yield this.worker.computeLineInformation(oldValue, newValue, disableWordDiff, compareMethod, linesOffset, this.props.alwaysShowLines);
                updateLineInformation = lineInformation;
                updateDiffLines = diffLines;
                lineInfoChanged = true;
                console.log('Diff computed', Date.now() - startTime);
            }
            let updateLineBlocks = this.state.lineBlocks;
            let updateBlocks = this.state.blocks;
            if (lineInfoChanged ||
                prevProps.extraLinesSurroundingDiff !==
                    this.props.extraLinesSurroundingDiff) {
                const extraLines = this.props.extraLinesSurroundingDiff < 0
                    ? 0
                    : Math.round(this.props.extraLinesSurroundingDiff);
                const { lineBlocks, blocks } = yield this.worker.computeHiddenBlocks(updateLineInformation, updateDiffLines, extraLines);
                updateLineBlocks = lineBlocks;
                updateBlocks = blocks;
            }
            if (updateBlocks !== this.state.blocks ||
                updateDiffLines !== this.state.diffLines ||
                updateLineBlocks !== this.state.lineBlocks ||
                updateLineInformation !== this.state.lineInformation) {
                this.setState((prev) => {
                    return Object.assign(Object.assign({}, prev), { blocks: updateBlocks, diffLines: updateDiffLines, lineBlocks: updateLineBlocks, lineInformation: updateLineInformation });
                });
            }
            const hasComputed = ((_c = this.state.lineInformation) === null || _c === void 0 ? void 0 : _c.length) > 0;
            (_e = (_d = this.props).onComputing) === null || _e === void 0 ? void 0 : _e.call(_d, !hasComputed);
        });
    }
}
DiffViewer.defaultProps = {
    oldValue: '',
    newValue: '',
    splitView: true,
    highlightLines: [],
    disableWordDiff: false,
    compareMethod: DiffMethod.CHARS,
    styles: {},
    hideLineNumbers: false,
    extraLinesSurroundingDiff: 3,
    showDiffOnly: true,
    useDarkTheme: false,
    linesOffset: 0,
    nonce: '',
};
function DynamicSizeList({ splitView, title, nodes, styles, }) {
    const listRef = React.useRef();
    const sizeMap = React.useRef({});
    const setSize = React.useCallback((index, size) => {
        sizeMap.current = Object.assign(Object.assign({}, sizeMap.current), { [index]: size });
        if (listRef.current) {
            listRef.current.resetAfterIndex(index);
        }
    }, []);
    const getSize = (index) => index === 0 ? 45 : sizeMap.current[index] || 1;
    const innerElementType = React.forwardRef((_a, ref) => {
        var { children } = _a, rest = __rest(_a, ["children"]);
        return (_jsx("table", Object.assign({ ref: ref }, rest, { className: cn(styles.diffContainer, {
                [styles.splitView]: splitView,
            }), children: _jsxs("tbody", { children: [Boolean(title) && title, children] }) })));
    });
    return (_jsx(AutoSizer, { children: ({ height, width }) => (_jsx(List, { ref: listRef, height: height, width: width, itemSize: getSize, itemCount: nodes.length + 1, itemData: {
                children: nodes,
                styles: styles,
                windowWidth: width,
                setSize: setSize,
            }, innerElementType: innerElementType, children: Row })) }));
}
function Row({ index, style, data, }) {
    const rowRef = React.useRef();
    React.useEffect(() => {
        var _a;
        if (!(rowRef === null || rowRef === void 0 ? void 0 : rowRef.current)) {
            return;
        }
        const boundingRect = (_a = rowRef === null || rowRef === void 0 ? void 0 : rowRef.current) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect();
        data.setSize(index, boundingRect.height);
    }, [data.setSize, index, data.windowWidth]);
    if (index === 0) {
        return null;
    }
    const row = data.children[index - 1];
    const content = row === null || row === void 0 ? void 0 : row.component;
    if (!content) {
        return null;
    }
    return (_jsx("tr", Object.assign({}, row.props, { ref: rowRef, style: Object.assign(Object.assign({}, style), { height: style.height > 1 ? style.height : undefined }), children: content })));
}
export default DiffViewer;
export { DiffMethod };
