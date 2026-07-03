import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { useFinanceController } from "./controllers/useFinanceController";
import SidebarView from "./views/SidebarView";
import OverviewView from "./views/OverviewView";
import TransactionsView from "./views/TransactionsView";
import BudgetView from "./views/BudgetView";
import CalculatorView from "./views/CalculatorView";
import FooterView from "./views/FooterView";
import CsvPreviewModal from "./views/CsvPreviewModal";
import CustomDialog from "./views/CustomDialog";
import LoginView from "./views/LoginView";

/**
 * App.tsx
 * The main Layout Orchestrator acting as the router for our MVC architecture.
 */
export default function App() {
  const controller = useFinanceController();
  const { activeTab } = controller;

  return (
    <div className="bg-[#F3F3F3] text-black min-h-screen flex flex-col md:flex-row font-sans selection:bg-[#ABF600] selection:text-black">
      
      {/* Brutalist Sidebar Navigation (View) */}
      <SidebarView 
        activeTab={controller.activeTab}
        setActiveTab={controller.setActiveTab}
        mobileMenuOpen={controller.mobileMenuOpen}
        setMobileMenuOpen={controller.setMobileMenuOpen}
        netBalance={controller.metrics.netBalance}
        currentUser={controller.currentUser}
        handleLogout={controller.handleLogout}
        
        // Supabase Integration Props
        supabaseStatus={controller.supabaseStatus}
        syncing={controller.syncing}
        lastSynced={controller.lastSynced}
        handleManualSync={controller.handleManualSync}
      />

      {/* Main Content Area Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* RLS Sync Error Banner */}
        {controller.syncError && (
          <div className="max-w-7xl mx-auto w-full px-4 md:px-8 mt-6">
            <div className="bg-red-100 border-4 border-black p-4 shadow-[4px_4px_0px_#000000] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h4 className="font-black text-sm uppercase tracking-tight">SINKRONISASI CLOUD TERHAMBAT</h4>
                  <p className="text-xs font-mono font-semibold text-neutral-700 mt-1">
                    Row-Level Security (RLS) di Supabase Anda aktif dan memblokir penyimpanan data.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  controller.setActiveTab("login");
                  setTimeout(() => {
                    document.getElementById("supabase-setup-alert-panel")?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
                className="bg-[#ABF600] hover:bg-[#8fd100] text-black border-2 border-black px-4 py-2 font-mono text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer whitespace-nowrap"
              >
                🛠️ Lihat Cara Memperbaiki
              </button>
            </div>
          </div>
        )}

        {/* Main Content Body */}
        <main className="flex-grow max-w-7xl mx-auto w-full px-4 md:px-8 py-10">
          <AnimatePresence mode="wait">
          
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <OverviewView 
                metrics={controller.metrics}
                transactions={controller.transactions}
                quickTxDesc={controller.quickTxDesc}
                setQuickTxDesc={controller.setQuickTxDesc}
                quickTxAmount={controller.quickTxAmount}
                setQuickTxAmount={controller.setQuickTxAmount}
                quickTxCategory={controller.quickTxCategory}
                setQuickTxCategory={controller.setQuickTxCategory}
                quickTxType={controller.quickTxType}
                setQuickTxType={controller.setQuickTxType}
                quickTxSuccess={controller.quickTxSuccess}
                handleQuickAddSubmit={controller.handleQuickAddSubmit}
                handleDeleteTransaction={controller.handleDeleteTransaction}
                setActiveTab={controller.setActiveTab}
              />
            </motion.div>
          )}

          {activeTab === "transactions" && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <TransactionsView 
                transactions={controller.transactions}
                filteredTransactions={controller.filteredTransactions}
                searchQuery={controller.searchQuery}
                setSearchQuery={controller.setSearchQuery}
                filterCategory={controller.filterCategory}
                setFilterCategory={controller.setFilterCategory}
                filterType={controller.filterType}
                setFilterType={controller.setFilterType}
                sortBy={controller.sortBy}
                setSortBy={controller.setSortBy}
                txDesc={controller.txDesc}
                setTxDesc={controller.setTxDesc}
                txAmount={controller.txAmount}
                setTxAmount={controller.setTxAmount}
                txCategory={controller.txCategory}
                setTxCategory={controller.setTxCategory}
                txType={controller.txType}
                setTxType={controller.setTxType}
                txDate={controller.txDate}
                setTxDate={controller.setTxDate}
                txIsRecurring={controller.txIsRecurring}
                setTxIsRecurring={controller.setTxIsRecurring}
                txRecurringInterval={controller.txRecurringInterval}
                setTxRecurringInterval={controller.setTxRecurringInterval}
                handleMainAddSubmit={controller.handleMainAddSubmit}
                handleDeleteTransaction={controller.handleDeleteTransaction}
                handleExportCSV={controller.handleOpenCSVPreview}
                handleUpdateRecurringStatus={controller.handleUpdateRecurringStatus}
                handlePayUpcoming={controller.handlePayUpcoming}
                
                // Trash Bin Props
                deletedTransactions={controller.deletedTransactions}
                handleRestoreTransaction={controller.handleRestoreTransaction}
                handlePermanentDeleteTransaction={controller.handlePermanentDeleteTransaction}
                handleClearTrash={controller.handleClearTrash}
              />
            </motion.div>
          )}

          {activeTab === "budget" && (
            <motion.div
              key="budget"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <BudgetView 
                budgets={controller.budgets}
                handleUpdateBudgetAllocated={controller.handleUpdateBudgetAllocated}
                triggerAlert={controller.triggerAlert}
              />
            </motion.div>
          )}

          {activeTab === "calculator" && (
            <motion.div
              key="calculator"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <CalculatorView 
                principal={controller.principal}
                setPrincipal={controller.setPrincipal}
                monthlyContribution={controller.monthlyContribution}
                setMonthlyContribution={controller.setMonthlyContribution}
                interestRate={controller.interestRate}
                setInterestRate={controller.setInterestRate}
                duration={controller.duration}
                setDuration={controller.setDuration}
                compoundResult={controller.compoundResult}
                triggerAlert={controller.triggerAlert}
              />
            </motion.div>
          )}

          {activeTab === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <LoginView 
                currentUser={controller.currentUser}
                users={controller.users}
                handleLogin={controller.handleLogin}
                handleRegister={controller.handleRegister}
                handleLogout={controller.handleLogout}
                handleDeleteSavedUser={controller.handleDeleteSavedUser}
                triggerAlert={controller.triggerAlert}
                
                // Supabase Integration Props
                supabaseStatus={controller.supabaseStatus}
                syncing={controller.syncing}
                lastSynced={controller.lastSynced}
                handleManualSync={controller.handleManualSync}
                syncError={controller.syncError}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer Block (View) */}
      <FooterView />

      {/* CSV Export Preview Modal */}
      <CsvPreviewModal 
        isOpen={controller.isPreviewOpen}
        onClose={() => controller.setIsPreviewOpen(false)}
        csvData={controller.csvPreviewData}
        onConfirmDownload={controller.handleExportCSV}
      />

      {/* Custom Dialog for Iframe/Sandbox safety */}
      <CustomDialog 
        isOpen={controller.dialogState.isOpen}
        type={controller.dialogState.type}
        title={controller.dialogState.title}
        message={controller.dialogState.message}
        onConfirm={controller.dialogState.onConfirm}
        onClose={controller.closeDialog}
      />

      </div>
    </div>
  );
}
