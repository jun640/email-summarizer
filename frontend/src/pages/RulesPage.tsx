import { useState } from 'react';
import Layout from '../components/Layout';
import RuleModal from '../components/RuleModal';
import { useRules, useCreateRule, useUpdateRule, useDeleteRule } from '../hooks/useRules';
import { FilterRule } from '../types';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

export default function RulesPage() {
  const { data: rules, isLoading } = useRules();
  const createRule = useCreateRule();
  const updateRule = useUpdateRule();
  const deleteRule = useDeleteRule();

  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<FilterRule | null>(null);

  const handleSave = (data: { name: string; conditionType: string; conditionValue: string; matchType: string }) => {
    if (editingRule) {
      updateRule.mutate({ id: editingRule.id, ...data } as any, { onSuccess: () => { setShowModal(false); setEditingRule(null); } });
    } else {
      createRule.mutate(data as any, { onSuccess: () => setShowModal(false) });
    }
  };

  const handleEdit = (rule: FilterRule) => {
    setEditingRule(rule);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this rule?')) {
      deleteRule.mutate(id);
    }
  };

  const conditionTypeLabels: Record<string, string> = {
    subject: 'Subject',
    sender: 'Sender',
    keyword: 'Keyword',
  };

  const matchTypeLabels: Record<string, string> = {
    contains: 'Contains',
    exact: 'Exact',
    regex: 'Regex',
  };

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Filter Rules</h1>
          <button
            onClick={() => { setEditingRule(null); setShowModal(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            New Rule
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : rules && rules.length > 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Condition</th>
                  <th className="px-4 py-3 font-medium">Match</th>
                  <th className="px-4 py-3 font-medium">Value</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{rule.name}</td>
                    <td className="px-4 py-3 text-gray-600">{conditionTypeLabels[rule.conditionType]}</td>
                    <td className="px-4 py-3 text-gray-600">{matchTypeLabels[rule.matchType]}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{rule.conditionValue}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => updateRule.mutate({ id: rule.id, isActive: !rule.isActive })}
                        className={`flex items-center gap-1 text-xs ${rule.isActive ? 'text-green-600' : 'text-gray-400'}`}
                      >
                        {rule.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEdit(rule)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(rule.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">No filter rules yet. Create one to start filtering emails.</p>
          </div>
        )}
      </div>

      {showModal && (
        <RuleModal
          rule={editingRule}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingRule(null); }}
        />
      )}
    </Layout>
  );
}
