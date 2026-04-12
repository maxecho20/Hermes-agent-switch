import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      app: {
        name: 'Hermes Switch',
        description: 'All-in-One management tool for Hermes Agent',
      },
      nav: {
        providers: 'Providers',
        mcp: 'MCP',
        skills: 'Skills',
        terminal: 'Terminal',
        gateway: 'Gateway',
        sessions: 'Sessions',
        memory: 'Memory',
        config: 'Config',
        settings: 'Settings',
      },
      providers: {
        title: 'Provider Manager',
        add: 'Add Provider',
        import_preset: 'Import Preset',
        export: 'Export',
        current: 'Current',
        switch: 'Switch',
        edit: 'Edit',
        delete: 'Delete',
        no_providers: 'No providers configured',
        no_providers_desc: 'Add a provider to get started with Hermes Agent',
      },
      common: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        confirm: 'Confirm',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        search: 'Search...',
      },
    },
  },
  zh: {
    translation: {
      app: {
        name: 'Hermes Switch',
        description: 'Hermes Agent 一站式管理工具',
      },
      nav: {
        providers: '供应商',
        mcp: 'MCP',
        skills: '技能',
        terminal: '终端',
        gateway: '网关',
        sessions: '会话',
        memory: '记忆',
        config: '配置',
        settings: '设置',
      },
      providers: {
        title: '供应商管理',
        add: '添加供应商',
        import_preset: '导入预设',
        export: '导出',
        current: '当前',
        switch: '切换',
        edit: '编辑',
        delete: '删除',
        no_providers: '暂无供应商配置',
        no_providers_desc: '添加供应商以开始使用 Hermes Agent',
      },
      common: {
        save: '保存',
        cancel: '取消',
        delete: '删除',
        confirm: '确认',
        loading: '加载中...',
        error: '错误',
        success: '成功',
        search: '搜索...',
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'zh',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
