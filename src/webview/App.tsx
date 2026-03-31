import { FlatListView } from '@/components/results/flat-list-view';
import { ResultsToolbar } from '@/components/results/results-toolbar';
import { TreeView } from '@/components/results/tree-view/TreeView';
import { SearchFilter } from '@/components/search/search-filter';
import { SearchHeader } from '@/components/search/search-header';
import { ToolbarBtn } from '@/components/ui/toolbar-btn';
import { useSearch } from '@/hooks/use-search';
import { useTooltipPositioning } from '@/hooks/use-tooltip-positioning';
import { useTreeState } from '@/hooks/use-tree-state';
import { cn } from '@/utils/tw-utils';

export const App: React.FC = () => {
  const { activeTooltip, showTooltip, hideTooltip } = useTooltipPositioning();

  const {
    query,
    setQuery,
    include,
    setInclude,
    exclude,
    setExclude,
    matchCase,
    setMatchCase,
    matchWord,
    setMatchWord,
    useRegex,
    setUseRegex,
    searchOpenEditors,
    setSearchOpenEditors,
    useExcludeSettings,
    setUseExcludeSettings,
    searchDirMode,
    setSearchDirMode,
    results,
    loading,
    isRefreshing,
    iconMap,
    history,
    hasWorkspace,
    showDetails,
    setShowDetails,
    isFlatList,
    setIsFlatList,
    openFile,
    openFolder,
  } = useSearch();

  const { tree, expanded, toggleFolder, expandAll, collapseAll } = useTreeState(results);

  if (!hasWorkspace) {
    return (
      <div className='flex h-full flex-col items-center justify-center gap-4 p-8 text-center'>
        <div
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-full bg-(--vscode-badge-background) opacity-20',
          )}>
          <i className='codicon codicon-folder-opened text-3xl!' />
        </div>
        <div className='flex flex-col gap-1'>
          <h3 className='text-[15px] font-semibold text-(--vscode-foreground)'>No Folder Open</h3>
          <p className='text-[13px] leading-relaxed opacity-60'>
            Open a folder or workspace to start searching throughout your files.
          </p>
        </div>
        <button
          onClick={openFolder}
          className='rounded bg-(--vscode-button-background) px-6 py-2 text-[13px] font-medium text-(--vscode-button-foreground) transition-colors duration-150 hover:bg-(--vscode-button-hoverBackground)'>
          Open Folder
        </button>
      </div>
    );
  }

  return (
    <div className='flex h-screen flex-col overflow-hidden bg-(--vscode-sideBar-background) text-(--vscode-foreground)'>
      {/* Background Refresh Progress Bar */}
      {isRefreshing && (
        <div className='absolute top-0 left-0 z-50 h-0.5 w-full overflow-hidden bg-transparent'>
          <div className='animate-progress-slide h-full w-full bg-(--vscode-progressBar-background)' />
        </div>
      )}

      {/* Search Header Section */}
      <div className='flex flex-col gap-3 p-2'>
        <SearchHeader
          query={query}
          setQuery={setQuery}
          matchCase={matchCase}
          setMatchCase={setMatchCase}
          matchWord={matchWord}
          setMatchWord={setMatchWord}
          useRegex={useRegex}
          setUseRegex={setUseRegex}
          showTooltip={showTooltip}
          hideTooltip={hideTooltip}
          history={history}
        />

        {/* Global Settings Bar */}
        <div className='flex items-center justify-between border-t border-(--vscode-sideBar-border) pt-2.5'>
          <div className='flex items-center gap-0.5'>
            <ToolbarBtn
              active={searchOpenEditors}
              icon='codicon-book'
              onClick={() => setSearchOpenEditors(!searchOpenEditors)}
              onMouseEnter={(e) => showTooltip(e, 'Search in Open Editors')}
              onMouseLeave={hideTooltip}
            />
            <ToolbarBtn
              active={useExcludeSettings}
              icon='codicon-exclude'
              onClick={() => setUseExcludeSettings(!useExcludeSettings)}
              onMouseEnter={(e) => showTooltip(e, 'Use Exclude Settings')}
              onMouseLeave={hideTooltip}
            />
            <ToolbarBtn
              active={searchDirMode}
              icon='codicon-folder'
              onClick={() => setSearchDirMode(!searchDirMode)}
              onMouseEnter={(e) => showTooltip(e, 'Directory Search Mode')}
              onMouseLeave={hideTooltip}
            />
          </div>

          <div className='flex items-center gap-0.5'>
            <ToolbarBtn
              active={showDetails}
              icon={showDetails ? 'codicon-chevron-up' : 'codicon-chevron-down'}
              onClick={() => setShowDetails(!showDetails)}
              onMouseEnter={(e) => showTooltip(e, showDetails ? 'Hide Advanced Filters' : 'Show Advanced Filters')}
              onMouseLeave={hideTooltip}
            />
          </div>
        </div>

        {/* Advanced Filters (Include/Exclude) */}
        {showDetails && (
          <div className='flex flex-col gap-2 border-(--vscode-sideBar-border) bg-(--vscode-sideBar-background)'>
            <SearchFilter
              label='Files to include'
              value={include}
              setValue={setInclude}
              placeholder='e.g. src/**, *.ts'
              showTooltip={showTooltip}
              hideTooltip={hideTooltip}
            />
            <SearchFilter
              label='Files to exclude'
              value={exclude}
              setValue={setExclude}
              placeholder='e.g. out/**, *.js'
              showTooltip={showTooltip}
              hideTooltip={hideTooltip}
            />
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className='flex flex-1 flex-col overflow-hidden'>
        <ResultsToolbar
          count={results.length}
          isFlatList={isFlatList}
          setIsFlatList={setIsFlatList}
          expandAll={expandAll}
          collapseAll={collapseAll}
          showTooltip={showTooltip}
          hideTooltip={hideTooltip}
          loading={loading}
        />

        <div className='flex-1 overflow-hidden'>
          {results.length === 0 ? (
            <div className='mt-20 flex flex-col items-center justify-center p-4 text-center opacity-40'>
              <i
                className={cn(
                  'codicon text-3xl!',
                  loading ? 'codicon-loading codicon-modifier-spin' : 'codicon-search',
                )}
              />
              <p className='mt-2 text-[12px]'>
                {query.trim() ? (loading ? 'Searching...' : 'No results found') : 'Type to start searching...'}
              </p>
            </div>
          ) : isFlatList ? (
            <FlatListView results={results} iconMap={iconMap} onOpen={openFile} />
          ) : (
            <TreeView nodes={tree} expanded={expanded} iconMap={iconMap} onToggle={toggleFolder} onOpen={openFile} />
          )}
        </div>
      </div>

      {/* Persistent Tooltip */}
      {activeTooltip && (
        <div
          className={cn(
            'pointer-events-none fixed z-50 -translate-x-1/2 rounded border border-(--vscode-editorHoverWidget-border) bg-(--vscode-editorHoverWidget-background) px-2 py-1 text-[12px] whitespace-nowrap text-(--vscode-editorHoverWidget-foreground) shadow-md',
          )}
          style={{ left: activeTooltip.x, top: activeTooltip.y }}>
          {activeTooltip.text}
        </div>
      )}
    </div>
  );
};

export default App;
