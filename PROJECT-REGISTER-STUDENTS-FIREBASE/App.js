import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles';

export default function App() {
  const [ editandoId, setEditandoId ] = useState(null);
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [curso, setCurso] = useState('');

  const FIREBASE_URL = 'https://firestore.googleapis.com/v1/projects/appaluno-ac8a4/databases/(default)/documents/alunos';

  useEffect(() => {
    buscarAlunos();
 }, []);

 const excluirAluno = async (id) => {
   try {
     const url = `${FIREBASE_URL}/${id}`;
     const resposta = await fetch(url, {method: 'DELETE'});

     if (resposta.ok) {
       buscarAlunos();
       Alert.alert('Aluno excluído com sucesso!');
     } else {
       Alert.alert('Erro ao excluir aluno');
     }
   } catch (erro) {
     console.error('Erro ao excluir aluno: ', erro)
   }
 };

 const iniciarEdicao = (aluno) => {
   setNome(aluno.nome);
   setIdade(aluno.idade);
   setCurso(aluno.curso)
   setEditandoId(aluno.id);
 };

 const atualizarAluno = async () => {
   if (!nome || !idade || !curso) {
     Alert.alert('Preencha todos os campos!');
     return;
   }

   const alunoAtualizado = {
     fields: {
       nome: { stringValue: nome },
       idade: { stringValue: idade},
       curso: { stringValue: curso },
     },
   };

   try {
     const url = `${FIREBASE_URL}/${editandoId}`;
     const resposta = await fetch(url, {
       method: 'PATCH',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(alunoAtualizado),
     });

     if (resposta.ok) {
       setNome('');
       setIdade('');
       setCurso('');
       setEditandoId(null);
       buscarAlunos();
       Alert.alert('Aluno atualizado com sucesso!');
     } else {
       Alert.alert('Erro ao atualizar aluno.');
     }
   } catch (erro) {
     console.error('Erro ao atualizar aluno:', erro);
   }
 };
 

  const buscarAlunos = async () => {
    try {
      const resposta = await fetch(FIREBASE_URL);
      const dados = await resposta.json();

      const lista = dados.documents?.map((doc) => {
        const fields = doc.fields;
        return {
          id: doc.name.split('/').pop(),
          nome: fields.nome.stringValue,
          idade: fields.idade.stringValue,
          curso: fields.curso.stringValue,
        };
      }) || [];
      setAlunos(lista);
    } catch (erro) {
      console.error('Erro ao buscar alunos:', erro);
    } finally {
      setLoading(false);
    }
  };

const adicionarAluno = async () => {
  if (!nome || !idade || !curso) {
    Alert.alert('Preencha todos os campos!');
    return;
  }

  const novoAluno = {
    fields: {
      nome: { stringValue: nome },
      idade: { stringValue: idade },
      curso: { stringValue: curso },
    },
  };

  try {
    const resposta = await fetch(FIREBASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify(novoAluno),
    });

    if (resposta.ok) {
      setNome('');
      setIdade('');
      setCurso('');
      buscarAlunos();
      Alert.alert('Aluno cadastrado com sucesso!');
    } else {
      Alert.alert('Erro ao cadastrar aluno');
    }
  } catch (erro) {
    console.error('Erro ao adicionar aluno', erro);
    Alert.alert('Erro na requisição');
  }
};

if (loading) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#0066cc" />
      <Text> Carregando dados...</Text>
    </View>
);
}
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}> Lista de Alunos </Text>

      <View style={styles.form}>
        <TextInput
          placeholder="Nome"
          style={styles.input}
          value={nome}
          onChangeText={setNome}
        />
        <TextInput
          placeholder="Idade"
          style={styles.input}
          value={idade}
          onChangeText={setIdade}
        />
        <TextInput
          placeholder="Curso"
          style={styles.input}
          value={curso}
          onChangeText={setCurso}
        />
        <Button title={editandoId ? 'Atualizar Aluno' : 'Adicionar Aluno'} onPress={editandoId ? atualizarAluno: adicionarAluno} />
      </View>

    <View style={{ flex: 1 }}>
      <FlatList
        data={alunos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
          <View style={{ paddingRight: 40 }}>
            <Text> Nome: {item.nome}</Text>
            <Text> Curso: {item.curso}</Text>
            <Text> Idade: {item.idade}</Text>
          </View>

          <View style={styles.iconContainer}>
            <TouchableOpacity onPress={() => iniciarEdicao(item)} style={styles.iconButton}>
              <Ionicons name="create-outline" size={24} color="#0066cc" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => excluirAluno(item.id)} style={styles.iconButton}>
              <Ionicons name="trash-outline" size={24} color="red" />
            </TouchableOpacity>
          </View>
        </View>
        )}
      />
    </View>
    </View>
  );
}
