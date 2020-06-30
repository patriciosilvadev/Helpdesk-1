const db = require("./../data/db.config");

class Tickets {
	tableName = "ticket";

	//Find all tickets
	fetchAllTickets() {
		return db(this.tableName);
	}

	//Add a new ticket to the database
	async createTicket(ticket) {
		try {
			await db(this.tableName).insert(ticket);

			const newTicket = await this.findTicket({ title: ticket.title });
			console.log("newTicket", newTicket);
			// Create a status for a ticket when  a ticket is created
			const [status] = await db("ticket_status")
				.insert({
					ticket_id: newTicket.id,
				})
				.returning("*");

			console.log("status", status);

			const [created_by] = await db("user").where({ id: ticket.created_by });
			console.log("Created by", created_by);
			return {
				...newTicket,
				created_by,
				ticket_status: status,
			};
		} catch (error) {
			throw new Error({
				message: error.message,
			});
		}
	}

	// find ticket based on what is passed in as filter
	async findTicket(filter) {
		return db(this.tableName).where(filter).first();
	}

	//returns all the tickets Status
	async allTicketStatus() {
		return db("ticket_status");
	}

	// Returns all tickets that have been resolved
	resolvedTickets() {
		return db("resolved_tickets");
	}

	// Returns a specific status for a specific ticket using the ticket ids
	async ticketStatus(ticket_id) {
		const ticket = await db(this.tableName)
			.join(`ticket_status`, `ticket_status.ticket_id`, `${this.tableName}.id`)
			.where(`ticket_status.ticket_id`, ticket_id)
			.first();

		return ticket;
	}

	// Method for solving a ticket, It Updates a ticket status from pending(default) to solved, which means a ticket has been solved
	async solveTicket({ solution, ticket_id, solved_by }) {
		try {
			await db("ticket_status")
				.where({ ticket_id: ticket_id })
				.update({ state: "solved" })
				.returning("*");

			/**
			 * Do you want a ticket to have multiple solutions?
			 * OR do you want a ticket to have just one solution?
			 *
			 * Answer:
			 *  Multiple solutions so that different users can give different answers to a questions
			 */
			const [ticketSolution] = await db("resolved_tickets")
				.insert({
					solution,
					resolved_by: solved_by,
					ticket_id,
				})
				.returning("*");

			const ticket = this.findTicket({ id: ticketSolution.ticket_id });

			const resolved_by = db("user").where({ id: ticketSolution.resolved_by }).first();
			return {
				id: ticketSolution.id,
				solution: ticketSolution.solution,
				ticket,
				resolved_by,
			};
		} catch (error) {
			throw new Error({
				message: error.message,
			});
		}
	}

	//Model to Delete a ticket
	async deleteTicket(id) {
		const ticketToDelete = await this.findTicket(id);
		if (!ticketToDelete) throw new Error(`Ticket with the id of ${id.id} does not exist`);

		const ticket = await db(this.tableName).where(id).del();
		return ticket;
	}

	async updateTicket(ticket) {
		if (!ticket.id) throw new Error(`Ticket Id is needed to update a ticket`);

		const [updatedTicket] = await db(this.tableName)
			.where({ id: ticket.id })
			.update(ticket)
			.returning("*");

		return updatedTicket;
	}
}

module.exports = Tickets;
