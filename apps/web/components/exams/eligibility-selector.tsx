'use client';

import React, { useState } from 'react';
import { ExamEligibilityEntity } from '@/types/exam';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Building, Plus, X, Save, Loader2 } from 'lucide-react';

interface EligibilitySelectorProps {
  eligibility?: ExamEligibilityEntity;
  onSave: (eligibility: Partial<ExamEligibilityEntity>) => Promise<void>;
  isLoading?: boolean;
}

export function EligibilitySelector({ eligibility, onSave, isLoading }: EligibilitySelectorProps) {
  const [departments, setDepartments] = useState<string[]>(eligibility?.allowedDepartmentIds || ['Computer Science']);
  const [newDept, setNewDept] = useState('');
  const [whitelist, setWhitelist] = useState<string[]>(eligibility?.candidateWhitelist || []);
  const [newEmail, setNewEmail] = useState('');

  const handleAddDept = () => {
    if (!newDept) return;
    setDepartments([...departments, newDept]);
    setNewDept('');
  };

  const handleRemoveDept = (dept: string) => {
    setDepartments(departments.filter((d) => d !== dept));
  };

  const handleAddEmail = () => {
    if (!newEmail) return;
    setWhitelist([...whitelist, newEmail.toLowerCase().trim()]);
    setNewEmail('');
  };

  const handleRemoveEmail = (email: string) => {
    setWhitelist(whitelist.filter((e) => e !== email));
  };

  const handleSave = async () => {
    await onSave({
      allowedDepartmentIds: departments,
      candidateWhitelist: whitelist
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" /> Target Academic Departments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add department name (e.g. Computer Science)..."
              value={newDept}
              onChange={(e) => setNewDept(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDept())}
            />
            <Button variant="outline" onClick={handleAddDept}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {departments.map((dept) => (
              <Badge key={dept} variant="secondary" className="text-xs px-3 py-1 flex items-center gap-1.5">
                {dept}
                <button type="button" onClick={() => handleRemoveDept(dept)} className="hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Specific Candidate Email Whitelist ({whitelist.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="candidate@university.edu..."
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEmail())}
            />
            <Button variant="outline" onClick={handleAddEmail}>
              <Plus className="h-4 w-4 mr-1" /> Whitelist Email
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {whitelist.map((email) => (
              <Badge key={email} variant="outline" className="text-xs px-3 py-1 font-mono flex items-center gap-1.5 border-primary/30 text-primary">
                {email}
                <button type="button" onClick={() => handleRemoveEmail(email)} className="hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={isLoading} className="px-6">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Eligibility Criteria
        </Button>
      </div>
    </div>
  );
}
