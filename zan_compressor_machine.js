// Turing-complete machine. Used for experiments in lossless data compression.

// TO DO: write programs' optimizers (via classical algorithms or via genetic algorithms)

/*
Rationale:
From a bits sequence (e.g. "1010") an unoptimized program is obtained
(e.g. prog_test_1), then an optimized program is obtatained (e.g. prog_test_1_opt).
If the optimized program that produces that sequence is shorter than
the sequence it can be used as a compressed version of the sequence,
that can be obtained again by running the program.
*/

function prog_test_1(){
	const dst=3 // 3->out
	const program0=[dst,1,1,1]
	const program1=[dst,0,1,1]
	const program2=[dst,1,1,1]
	const program3=[dst,0,1,1]
	const program=[program0,program1,program2,program3]

	return program
}
function prog_test_1_opt(){
	const dst=3 // 3->out
	const program0=[dst,1,1,1]
	const program1=[dst,0,-1,-1]
	const program=[program0,program1]

	return program
}
const program=prog_test_1()

const out_expected_array = [1,0,1,0]
const out_expected_ref_len = out_expected_array.length // it is saved as it will vary

const no_out_threshold=out_expected_ref_len

class Machine{

static get initial_memory(){
	// init memory
	const memory=[0,1,0]
	// memory[0]=0 // 0
	// memory[1]=1 // 1
	// memory[2]=0 // path selector

	return memory
}

get min_instruction_index(){
	const dictionary=this.program_array
	const min_instruction_index=Math.min(...Object.keys(dictionary))
	return min_instruction_index
}

set program(program_to_set){
	this.memory=Machine.initial_memory
	
	this.program_array=program_to_set

	this.current_instruction_index=this.min_instruction_index
	this.out_expected_working=out_expected_array

	// counters
	this.no_out_counter=0
	this.out_counter=0
	this.step_counter=0
	this.update_counter=new Array(this.program_array.length).fill(0)
}

// execution loop
step(){

	this.step_counter++

	// fetch current intruction
	const current_instruction=this.program_array[this.current_instruction_index]

	// ---------- bit-copy operation -----------

	// 2nd field is for copy-origin
	const field_origin=current_instruction[1]

	// read data from memory
	var bit_data
	if(field_origin==0||field_origin==1)bit_data=field_origin
	else bit_data=this.memory[field_origin+this.current_instruction_index]

	// write the data that was read

	// 1st field is copy-destination
	const field_destination=current_instruction[0]

	const correct_output=bit_data==this.out_expected_working[0]

	//DESTINATION_OUTPUT_PORT
	if(field_destination==3){

		if(correct_output){
			this.out_expected_working=this.out_expected_working.slice(1)
			console.log( bit_data )
			this.out_counter++
			this.no_out_counter=0
			this.update_counter[this.current_instruction_index]++
		}
		
	}else{

		this.no_out_counter++
		
		// write data to memory
		if(this.memory[field_destination+this.current_instruction_index]!=bit_data){
			this.memory[field_destination+this.current_instruction_index] = bit_data
			this.update_counter[this.current_instruction_index]++
		}
	}

	//  -------- path selection -------------
	const path_selector_bit=this.memory[2]
	if(path_selector_bit==0){

		const field_instruction_for_case_zero = current_instruction[2]
		this.current_instruction_index += field_instruction_for_case_zero
		
	}else if(path_selector_bit==1){

		const field_instruction_for_case_one = current_instruction[3]
		this.current_instruction_index += field_instruction_for_case_one
	}

	const last_step=(correct_output && this.out_counter==out_expected_ref_len)||!correct_output||(this.no_out_counter>no_out_threshold)
	return last_step

} // end of step of execution loop

execute_program(){
	// execution loop
	while(!this.step()){}
}

} // end of Machine class

m=new Machine()
m.program=program
m.execute_program()

console.log('m.step_counter:'+m.step_counter)
//console.log('m.program_array.length:'+m.program_array.length)
console.log('m.update_counter:'+m.update_counter)
console.log('value:'+m.update_counter.map(n=>n/m.step_counter))

score=(m.step_counter)
console.log('score:'+score)

