  const saveCompany = async () => {
    console.log('🔍 saveCompany chamado');
    
    if (!editingCompany) {
      alert('❌ Erro: Dados da empresa não encontrados');
      return;
    }

    // Validações básicas
    if (!editingCompany.name || !editingCompany.cnpj || !editingCompany.email || !editingCompany.phone) {
      alert('❌ Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      console.log('🚀 Salvando empresa...');
      
      const companyData = {
        name: editingCompany.name,
        cnpj: editingCompany.cnpj,
        email: editingCompany.email,
        phone: editingCompany.phone,
        ownerEmail: user?.email || 'unknown',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        id: editingCompany.id || generateUniqueId()
      };

      // Salvar no Firebase
      try {
        await setDoc(doc(db, 'empresas', companyData.id.toString()), companyData);
        console.log('✅ Empresa salva no Firebase');
        alert('✅ Empresa salva com sucesso!');
      } catch (firebaseError) {
        console.error('❌ Erro Firebase:', firebaseError);
        alert('❌ Erro ao salvar no Firebase');
        return;
      }

      // Atualizar estado local
      if (editingCompany.id) {
        setCompanies(prev => prev.map(company =>
          company.id === editingCompany.id ? companyData : company
        ));
      } else {
        setCompanies(prev => [...prev, companyData]);
      }

      // Fechar formulário
      setEditingCompany(null);
      setShowCompanyForm(false);
      setActiveSubSection('companies-list');
      
    } catch (error) {
      console.error('❌ Erro geral:', error);
      alert('❌ Erro ao salvar empresa');
    }
  };

