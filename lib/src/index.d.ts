import * as React from 'react';
import { ReactElement } from 'react';
import { Block } from './compute-hidden-blocks';
import { DiffInformation, DiffMethod, DiffType, LineInformation } from './compute-lines';
import { ReactDiffViewerStyles, ReactDiffViewerStylesOverride } from './styles';
export declare enum LineNumberPrefix {
    LEFT = "L",
    RIGHT = "R"
}
export interface ReactDiffViewerProps {
    oldValue: string | JSON;
    newValue: string | JSON;
    splitView?: boolean;
    linesOffset?: number;
    disableWordDiff?: boolean;
    compareMethod?: DiffMethod;
    extraLinesSurroundingDiff?: number;
    hideLineNumbers?: boolean;
    /**
     * Show the lines indicated here. Specified as L20 or R18 for respectively line 20 on the left or line 18 on the right.
     */
    alwaysShowLines?: string[];
    showDiffOnly?: boolean;
    renderContent?: (source: string) => ReactElement;
    codeFoldMessageRenderer?: (totalFoldedLines: number, leftStartLineNumber: number, rightStartLineNumber: number) => ReactElement;
    onLineNumberClick?: (lineId: string, event: React.MouseEvent<HTMLTableCellElement>) => void;
    renderGutter?: (data: {
        lineNumber: number;
        type: DiffType;
        prefix: LineNumberPrefix;
        value: string | DiffInformation[];
        additionalLineNumber: number;
        additionalPrefix: LineNumberPrefix;
        styles: ReactDiffViewerStyles;
    }) => ReactElement;
    highlightLines?: string[];
    styles?: ReactDiffViewerStylesOverride;
    useDarkTheme?: boolean;
    leftTitle?: string | ReactElement;
    rightTitle?: string | ReactElement;
    nonce?: string;
    onComputing?: (loading: boolean) => void;
}
export interface ReactDiffViewerState {
    lineInformation?: LineInformation[];
    expandedBlocks?: number[];
    diffLines?: number[];
    lineBlocks: Record<number, number>;
    blocks: Block[];
    ready: boolean;
}
declare class DiffViewer extends React.Component<ReactDiffViewerProps, ReactDiffViewerState> {
    private styles;
    private worker;
    static defaultProps: ReactDiffViewerProps;
    constructor(props: ReactDiffViewerProps);
    componentDidMount(): Promise<void>;
    componentWillUnmount(): Promise<void>;
    /**
     * Resets code block expand to the initial stage. Will be exposed to the parent component via
     * refs.
     */
    resetCodeBlocks: () => boolean;
    /**
     * Pushes the target expanded code block to the state. During the re-render,
     * this value is used to expand/fold unmodified code.
     */
    private onBlockExpand;
    /**
     * Computes final styles for the diff viewer. It combines the default styles with the user
     * supplied overrides. The computed styles are cached with performance in mind.
     *
     * @param styles User supplied style overrides.
     */
    private computeStyles;
    /**
     * Returns a function with clicked line number in the closure. Returns an no-op function when no
     * onLineNumberClick handler is supplied.
     *
     * @param id Line id of a line.
     */
    private onLineNumberClickProxy;
    /**
     * Maps over the word diff and constructs the required React elements to show word diff.
     *
     * @param diffArray Word diff information derived from line information.
     * @param renderer Optional renderer to format diff words. Useful for syntax highlighting.
     */
    private renderWordDiff;
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
    private renderLine;
    /**
     * Generates lines for split view.
     *
     * @param obj Line diff information.
     * @param obj.left Life diff information for the left pane of the split view.
     * @param obj.right Life diff information for the right pane of the split view.
     * @param index React key for the lines.
     */
    private renderSplitView;
    /**
     * Generates lines for inline view.
     *
     * @param obj Line diff information.
     * @param obj.left Life diff information for the added section of the inline view.
     * @param obj.right Life diff information for the removed section of the inline view.
     * @param index React key for the lines.
     */
    renderInlineView: ({ left, right }: LineInformation, index: number, styles: React.CSSProperties) => ReactElement;
    /**
     * Returns a function with clicked block number in the closure.
     *
     * @param id Cold fold block id.
     */
    private onBlockClickProxy;
    /**
     * Generates cold fold block. It also uses the custom message renderer when available to show
     * cold fold messages.
     *
     * @param num Number of skipped lines between two blocks.
     * @param blockNumber Code fold block id.
     * @param leftBlockLineNumber First left line number after the current code fold block.
     * @param rightBlockLineNumber First right line number after the current code fold block.
     */
    private renderSkippedLineIndicator;
    componentDidUpdate(prevProps: Readonly<ReactDiffViewerProps>): Promise<void>;
    _componentDidUpdate(prevProps: Readonly<ReactDiffViewerProps>, computeNow?: boolean): Promise<void>;
    /**
     * Generates the entire diff view.
     */
    private renderDiff;
    render: () => ReactElement;
}
export default DiffViewer;
export { DiffMethod, ReactDiffViewerStylesOverride };
