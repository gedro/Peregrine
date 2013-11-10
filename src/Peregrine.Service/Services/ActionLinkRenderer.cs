﻿using System.Linq;
using Peregrine.Service.Model;

namespace Peregrine.Service.Services
{
	public class ActionLinkRenderer
	{
		public object Render(ActionLink actionLink)
		{
			return new
			{
				name = actionLink.Name,
				method = actionLink.Method,
				href = actionLink.Href,
				@params = actionLink.Parameters.Select(param => new
				{
					name = param,
				})
			};
		}
	}
}